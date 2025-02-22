// apps/backend/auth-service/src/app/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User as IUser } from '@mediprotek/shared-interfaces';
import { Role } from '@shared/enums/role.enum';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User implements IUser {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID único del usuario (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico del usuario',
    maxLength: 50,
  })
  @Column({
    unique: true,
    length: 50,
  })
  email: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
    maxLength: 100,
  })
  @Column({
    length: 100,
    name: 'first_name',
  })
  firstName: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
    maxLength: 100,
  })
  @Column({
    length: 100,
    name: 'last_name',
  })
  lastName: string;

  @ApiProperty({
    enum: Role,
    default: Role.USER,
    description: 'Rol del usuario en el sistema',
  })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @ApiHideProperty() // Ocultamos la contraseña en la documentación
  @Column({
    select: false,
  })
  password: string;

  @ApiProperty({
    example: '2024-02-22T20:32:02.000Z',
    description: 'Fecha de creación del usuario',
  })
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-02-22T20:32:02.000Z',
    description: 'Fecha de última actualización del usuario',
  })
  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
