import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserCommand, UpdateUserCommand, UserEventPatterns } from '@libs/shared-interfaces/src/lib/events/user.events';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('USER_SERVICE') private readonly client: ClientProxy
  ) {}

  async create(createUserDto: CreateUserCommand): Promise<User> {
    try {
      console.log(' Creating user in user-service:', { 
        email: createUserDto.email,
        password: createUserDto.password?.substring(0, 3) + '...' // Solo mostramos una parte por seguridad
      });

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      console.log(' Password hashed in user-service:', {
        originalPassword: createUserDto.password?.substring(0, 3) + '...',
        hashedPassword: hashedPassword?.substring(0, 20) + '...'
      });

      // Crear el usuario con la contraseña hasheada
      const user = await this.userRepository.save({
        ...createUserDto,
        password: hashedPassword
      });

      console.log(' User saved in user-service:', { 
        id: user.id, 
        email: user.email,
        hasPassword: !!user.password
      });

      // Emitir evento de usuario creado sin contraseña
      const { password, ...userWithoutPassword } = user;
      await this.client.emit('user.events', {
        type: 'user.created',
        ...userWithoutPassword
      });

      console.log(' User creation event emitted');
      
      // Devolver usuario completo con contraseña hasheada para el auth-service
      return {
        ...userWithoutPassword,
        password: hashedPassword // Incluimos la contraseña hasheada en la respuesta
      } as User;
    } catch (error) {
      console.error(' Error creating user:', error);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserCommand): Promise<User> {
    console.log(' Updating user:', { id });
    
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      // Remover el id del DTO de actualización para evitar duplicados
      const { id: _, ...updateDataWithoutId } = updateUserDto;

      // Emitir evento de usuario actualizado
      await this.client.send('user.events.updated', {
        type: 'user.updated',
        id,
        ...updateDataWithoutId,
        updatedAt: new Date()
      }).toPromise();
      console.log(' Update event sent successfully');

      // Actualizar usuario en la base de datos usando los datos sin id
      const updatedUser = await this.userRepository.save({
        ...user,
        ...updateDataWithoutId
      });
      console.log(' User updated in database');

      return updatedUser;
    } catch (error) {
      console.error(' Error updating user:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user);

    // Emitir evento de usuario eliminado
    await this.client.emit('user.events', {
      type: 'user.deleted',
      id,
      deletedAt: new Date()
    });
  }

  async deleteBulk(ids: string[]): Promise<void> {
    console.log(' Deleting multiple users:', ids);
    
    // Encontrar todos los usuarios
    const users = await this.userRepository.findBy({ id: In(ids) });
    if (users.length !== ids.length) {
      const foundIds = users.map(u => u.id);
      const missingIds = ids.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Some users were not found: ${missingIds.join(', ')}`);
    }

    // Emitir eventos de eliminación para cada usuario ANTES de eliminarlos
    // Esto asegura que el auth-service reciba los eventos antes de que los usuarios sean eliminados
    const deleteEvents = users.map(user => 
      this.client.send('user.events.deleted', {
        type: 'user.deleted',
        id: user.id,
        deletedAt: new Date()
      }).toPromise() // Convertir el Observable a Promise
    );

    try {
      // Esperar a que todos los eventos se emitan
      await Promise.all(deleteEvents);
      console.log(' Delete events emitted for all users');

      // Eliminar usuarios
      await this.userRepository.remove(users);
      console.log(' Users deleted from database');

      // Esperar un momento para asegurar que los eventos sean procesados
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(' Users deleted successfully');
    } catch (error) {
      console.error(' Error during bulk deletion:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      users,
      total,
      page,
      lastPage: Math.ceil(total / limit)
    };
  }
}
