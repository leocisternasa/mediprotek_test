// apps/backend/auth-service/src/app/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@entities/user.entity';
import { LoginDto, RegisterDto, AuthResponse } from '@mediprotek/shared-interfaces';
import { JwtPayload } from '@interfaces/auth/jwt-payload.interface';
import { UpdateUserDto } from '@shared/dtos/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private createToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      console.log('Iniciando registro con datos:', { ...registerDto, password: '[REDACTED]' });

      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }

      console.log('Creando nuevo usuario...');
      const user = this.userRepository.create(registerDto);
      console.log('Usuario creado en memoria:', { ...user, password: '[REDACTED]' });

      console.log('Guardando usuario en la base de datos...');
      const savedUser = await this.userRepository.save(user);
      console.log('Usuario guardado en la base de datos:', {
        ...savedUser,
        password: '[REDACTED]',
      });

      console.log('Buscando usuario guardado...');
      const userWithoutPassword = await this.userRepository.findOne({
        where: { id: savedUser.id },
      });

      if (!userWithoutPassword) {
        throw new NotFoundException('Error al crear el usuario');
      }

      console.log('Usuario encontrado, generando token...');
      const token = this.createToken(savedUser);
      console.log('Token generado exitosamente');

      return {
        user: userWithoutPassword,
        accessToken: token,
      };
    } catch (error) {
      console.error('Error en el registro:', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role'], // Incluimos explícitamente el password
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: this.createToken(user),
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = 'name',
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<{ users: User[]; total: number }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Mapear los nombres de columnas del frontend a los nombres de columnas de la base de datos
    const columnMap: { [key: string]: string } = {
      name: 'firstName',
      email: 'email',
      role: 'role'
    };

    const dbColumn = columnMap[sortBy] || 'firstName';
    
    // Si estamos ordenando por nombre, ordenar por firstName y lastName
    if (sortBy === 'name') {
      queryBuilder
        .orderBy(`user.firstName`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
        .addOrderBy(`user.lastName`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy(`user.${dbColumn}`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { users, total };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Si se está actualizando la contraseña, la entidad se encargará de hashearla
    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }
}
