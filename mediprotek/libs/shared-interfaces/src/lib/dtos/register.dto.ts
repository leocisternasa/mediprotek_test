import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Role } from '@shared/enums/role.enum';

export class RegisterDto {
  @IsEmail(
    {},
    {
      message: 'El correo electrónico proporcionado no es válido',
    },
  )
  @MaxLength(50)
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/)
  lastName: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, {
    message:
      'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial',
  })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'El rol debe ser admin o user' })
  role?: Role;
}
