import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    required: false,
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    required: false,
    description: 'Nombre del usuario',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    required: false,
    description: 'Apellido del usuario',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    required: false,
    description: 'Nueva contraseña del usuario',
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}
