import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
  @MaxLength(50, {
    message: 'El correo electrónico no puede tener más de 50 caracteres',
  })
  email: string;

  @ApiProperty({
    example: 'MiContraseña123',
    description: 'Contraseña del usuario',
  })
  @IsString({
    message: 'La contraseña debe ser una cadena de texto',
  })
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  })
  @MaxLength(50, {
    message: 'La contraseña no puede tener más de 50 caracteres',
  })
  password: string;
}
