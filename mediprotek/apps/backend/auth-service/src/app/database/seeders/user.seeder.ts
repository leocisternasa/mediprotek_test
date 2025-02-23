// apps/backend/auth-service/src/app/database/seeders/user.seeder.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '@shared/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed() {
    const users = [
      // Administradores
      {
        firstName: 'Leonardo',
        lastName: 'Cisternas',
        email: 'leonardo.cisternas@mediprotek.com',
        password: 'Admin123!',
        role: Role.ADMIN,
      },
      {
        firstName: 'Pablo',
        lastName: 'Neruda',
        email: 'pablo.neruda@mediprotek.com',
        password: 'Admin123!',
        role: Role.ADMIN,
      },
      // Usuarios regulares
      {
        firstName: 'Mon',
        lastName: 'Laferte',
        email: 'mon.laferte@mediprotek.com',
        password: 'User123!',
        role: Role.USER,
      },
      {
        firstName: 'Alexis',
        lastName: 'Sánchez',
        email: 'alexis.sanchez@mediprotek.com',
        password: 'User123!',
        role: Role.USER,
      },
      {
        firstName: 'Arturo',
        lastName: 'Vidal',
        email: 'arturo.vidal@mediprotek.com',
        password: 'User123!',
        role: Role.USER,
      },
      {
        firstName: 'Daniela',
        lastName: 'Vega',
        email: 'daniela.vega@mediprotek.com',
        password: 'User123!',
        role: Role.USER,
      },
      {
        firstName: 'Jorge',
        lastName: 'González',
        email: 'jorge.gonzalez@mediprotek.com',
        password: 'User123!',
        role: Role.USER,
      },
      {
        firstName: 'Cecilia',
        lastName: 'Bolocco',
        email: 'cecilia.bolocco@mediprotek.com',
        password: 'User123!',
        role: Role.USER,
      },
    ];

    for (const userData of users) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        console.log(`Contraseña hasheada para ${userData.email}:`, hashedPassword);
        const user = this.userRepository.create({
          ...userData,
          password: hashedPassword,
        });
        await this.userRepository.save(user);
        console.log(`Usuario creado: ${user.firstName} ${user.lastName} (${user.role})`);
      } else {
        console.log(`Usuario ya existe: ${userData.email}`);
      }
    }
  }
}
