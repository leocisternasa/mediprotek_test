import { Role } from '../enums/role.enum';

export enum AuthEventPatterns {
  // Comandos
  REGISTER_USER = 'auth.command.register',
  LOGIN_USER = 'auth.command.login',
  REFRESH_TOKEN = 'auth.command.refresh_token',
  LOGOUT_USER = 'auth.command.logout',
  
  // Eventos
  USER_REGISTERED = 'auth.event.registered',
  USER_LOGGED_IN = 'auth.event.logged_in',
  USER_LOGGED_OUT = 'auth.event.logged_out',
  TOKEN_REFRESHED = 'auth.event.token_refreshed'
}

// Comandos
export interface RegisterUserCommand {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface LoginUserCommand {
  email: string;
  password: string;
}

export interface RefreshTokenCommand {
  refreshToken: string;
}

export interface LogoutUserCommand {
  userId: string;
  refreshToken: string;
}

// Eventos
export interface UserRegisteredEvent {
  id: string;
  email: string;
  role: Role;
  timestamp: Date;
}

export interface UserLoggedInEvent {
  id: string;
  email: string;
  role: Role;
  timestamp: Date;
}

export interface UserLoggedOutEvent {
  id: string;
  email: string;
  timestamp: Date;
}

export interface TokenRefreshedEvent {
  id: string;
  email: string;
  timestamp: Date;
}
