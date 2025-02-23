// apps/backend/auth-service/src/app/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Delete,
  Param,
  ParseUUIDPipe,
  ForbiddenException,
  Put,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponse } from '@mediprotek/shared-interfaces';
import { AuthResponseDto } from '@dtos/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from './guards/roles.guard';
import { Role } from '@shared/enums/role.enum';
import { Roles } from './decorators/roles.decorator';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermissions } from './decorators/permissions.decorator';
import { Permission } from '@shared/enums/permission.enum';
import { UpdateUserDto } from '@dtos/update-user.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de registro inválidos',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener lista de usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    type: [User],
  })
  async getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
  ) {
    return this.authService.findAll(page, limit, search, sortBy, sortDirection);
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado exitosamente',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User
  ) {
    // Solo admin puede ver cualquier usuario
    // Usuarios normales solo pueden ver su propio perfil
    if (currentUser.role !== Role.ADMIN && id !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para ver este usuario');
    }
    return this.authService.findById(id);
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: User,
  })
  async createUser(@Body() createUserDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(createUserDto);
  }

  @Put('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: User,
  })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    // Solo admin puede actualizar cualquier usuario
    // Usuarios normales solo pueden actualizar su propio perfil
    if (currentUser.role !== Role.ADMIN && id !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para actualizar este usuario');
    }
    return this.authService.update(id, updateUserDto);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para eliminar usuarios',
  })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: User) {
    // Solo admin puede eliminar cualquier usuario
    // Usuarios normales solo pueden eliminar su propio perfil
    if (currentUser.role !== Role.ADMIN && id !== currentUser.id) {
      throw new ForbiddenException('No tienes permiso para eliminar este usuario');
    }
    return this.authService.delete(id);
  }

  @Delete('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar usuarios masivamente (Solo administradores)' })
  @ApiResponse({
    status: 200,
    description: 'Usuarios eliminados exitosamente',
  })
  async deleteUsers(@Body() ids: string[]) {
    for (const id of ids) {
      await this.authService.delete(id);
    }
  }
}
