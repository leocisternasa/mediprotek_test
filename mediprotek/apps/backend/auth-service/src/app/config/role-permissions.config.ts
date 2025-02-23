import { Role } from '@shared/enums/role.enum';
import { Permission } from '@shared/enums/permission.enum';

export const RolePermissions = new Map<Role, Permission[]>([
  [Role.USER, [Permission.READ_PROFILE, Permission.UPDATE_PROFILE]],

  [Role.ADMIN, Object.values(Permission)],
]);
