import { Role } from '@libs/shared-interfaces/src/lib/enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Express.Request {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}
