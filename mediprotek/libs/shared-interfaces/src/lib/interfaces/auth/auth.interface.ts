import { Role } from '../../enums/role.enum';
import { UserResponse } from '../user/user.interface';

// Representa el usuario en el servicio de autenticación
export interface AuthUser {
  id: string;
  email: string;
  password: string;
  role: Role;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Respuesta al autenticarse
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

// Payload del token JWT
export interface TokenPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// Tokens de autenticación
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// DTO para el refresh token
export interface RefreshTokenDto {
  refreshToken: string;
}

// Respuesta al refrescar el token
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Estado de autenticación en el frontend (sin tokens)
export interface AuthState {
  user: UserResponse;
}
