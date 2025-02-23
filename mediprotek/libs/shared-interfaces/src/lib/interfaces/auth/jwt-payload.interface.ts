import { Role } from '../../enums/role.enum';

export interface JwtPayload {
  sub: string; // user uuid
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  iat?: number; // issued at
  exp?: number; // expiration
}
