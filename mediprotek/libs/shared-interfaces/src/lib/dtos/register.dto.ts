import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@shared/enums/role.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail(
    {},
    {
      message: 'El correo electrónico proporcionado no es válido',
    },
  )
  @MaxLength(50)
  email: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/)
  firstName: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/)
  lastName: string;

  @ApiProperty({
    example: 'MiContraseña123',
    description:
      'Contraseña del usuario (mínimo 6 caracteres, debe incluir mayúsculas, minúsculas y números)',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)
  password: string;

  @ApiProperty({
    enum: Role,
    default: Role.USER,
    required: false,
    description: 'Rol del usuario (opcional, por defecto: user)',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
