import { Role } from '../enums/role.enum';

export enum UserEventPatterns {
  // Comandos
  CREATE_USER = 'user.command.create',
  UPDATE_USER = 'user.command.update',
  DELETE_USER = 'user.command.delete',

  // Eventos
  USER_CREATED = 'user.event.created',
  USER_UPDATED = 'user.event.updated',
  USER_DELETED = 'user.event.deleted',

  // Queries
  GET_USER = 'user.query.get',
  GET_USERS = 'user.query.get_all',
}

// Comandos
export interface CreateUserCommand {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  password: string;
  birthDate?: Date;
  phone?: string;
}

export interface UpdateUserCommand {
  id: string;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  phone?: string;
}

export interface DeleteUserCommand {
  id: string;
}

// Eventos
export interface UserCreatedEvent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  birthDate?: Date;
  phone?: string;
  createdAt: Date;
}

export interface UserUpdatedEvent {
  id: string;
  changes: {
    firstName?: string;
    lastName?: string;
    birthDate?: Date;
    phone?: string;
  };
  updatedAt: Date;
}

export interface UserDeletedEvent {
  id: string;
  deletedAt: Date;
}

// Queries
export interface GetUserQuery {
  id: string;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}
