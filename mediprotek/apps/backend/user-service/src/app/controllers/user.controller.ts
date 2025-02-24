import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { UserService } from '../services/user.service';
import {
  CreateUserCommand,
  DeleteUserCommand,
  GetUserQuery,
  GetUsersQuery,
  UpdateUserCommand,
  UserEventPatterns,
} from '@libs/shared-interfaces/src/lib/events/user.events';
import { CreateUserDto } from '@mediprotek/shared-interfaces';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // RabbitMQ Event Handler
  @EventPattern('user.created')
  async handleUserCreated(@Payload() data: CreateUserCommand) {
    console.log('📡 Received user.created event:', data);
    try {
      const createUserDto: CreateUserCommand = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        password: 'SYNC_USER', // Password temporal ya que el usuario ya está autenticado en auth-service
      };
      await this.userService.create(createUserDto);
      console.log('✅ User created in user-service');
    } catch (error) {
      console.error('❌ Error creating user in user-service:', error);
    }
  }

  // HTTP Endpoints
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string
  ) {
    return this.userService.findAll(+page, +limit, search);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createNewUser(@Body() createUserDto: CreateUserCommand) {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateExistingUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserCommand
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteExistingUser(@Param('id') id: string) {
    await this.userService.delete(id);
    return { message: 'User deleted successfully' };
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteBulkUsers(@Body() userIds: string[]) {
    console.log('📡 Deleting multiple users:', userIds);
    await this.userService.deleteBulk(userIds);
    return { message: 'Users deleted successfully' };
  }

  @MessagePattern(UserEventPatterns.CREATE_USER)
  async createUser(@Payload() data: CreateUserCommand) {
    return this.userService.create(data);
  }

  @MessagePattern(UserEventPatterns.UPDATE_USER)
  async updateUser(@Payload() data: UpdateUserCommand) {
    return this.userService.update(data.id, data);
  }

  @MessagePattern(UserEventPatterns.DELETE_USER)
  async deleteUser(@Payload() data: DeleteUserCommand) {
    return this.userService.delete(data.id);
  }

  @MessagePattern(UserEventPatterns.GET_USER)
  async getUser(@Payload() data: GetUserQuery) {
    return this.userService.findOne(data.id);
  }

  @MessagePattern(UserEventPatterns.GET_USERS)
  async getUsers(@Payload() data: GetUsersQuery) {
    return this.userService.findAll(data.page, data.limit, data.search);
  }
}
