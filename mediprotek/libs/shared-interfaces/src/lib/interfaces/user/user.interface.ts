import { Role } from '../../enums/role.enum';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role; // Usamos el enum Role
  createdAt: Date;
  updatedAt: Date;
}
