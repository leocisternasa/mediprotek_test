export enum Permission {
  // Permisos de Usuario
  READ_PROFILE = 'read_profile',
  UPDATE_PROFILE = 'update_profile',

  // Permisos de Administración
  READ_USERS = 'read_users',
  CREATE_USERS = 'create_users',
  UPDATE_USERS = 'update_users',
  DELETE_USERS = 'delete_users',

  // Permisos de Sistema
  MANAGE_ROLES = 'manage_roles',
  MANAGE_PERMISSIONS = 'manage_permissions',
}
