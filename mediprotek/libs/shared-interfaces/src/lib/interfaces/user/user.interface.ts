import { Role } from '../../enums/role.enum';

// Representa el usuario en el servicio de usuarios
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate?: Date;
  phone?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para crear usuario
export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  password: string;
  birthDate?: Date;
  phone?: string;
}

// DTO para actualizar usuario
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  phone?: string;
}

// DTO para respuesta de usuario
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate?: Date;
  phone?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para respuesta paginada de usuarios
export interface UserPaginatedResponse {
  users: UserResponse[];
  total: number;
  page: number;
  limit: number;
}

// DTO para filtros de usuarios
export interface UserFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
