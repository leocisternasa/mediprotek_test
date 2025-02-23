import { IsEmail, IsString, IsOptional, MinLength, MaxLength, IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  lastName?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
