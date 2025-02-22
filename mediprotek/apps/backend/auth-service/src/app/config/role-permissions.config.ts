import { Role } from '@shared/enums/role.enum';
import { Permission } from '@shared/enums/permission.enum';

export const RolePermissions = new Map<Role, Permission[]>([
  [Role.USER, [Permission.READ_PROFILE, Permission.UPDATE_PROFILE]],
  [
    Role.ADMIN,
    [
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.READ_USERS,
      Permission.CREATE_USERS,
      Permission.UPDATE_USERS,
    ],
  ],
  [
    Role.SUPER_ADMIN,
    Object.values(Permission), // Todos los permisos
  ],
]);
