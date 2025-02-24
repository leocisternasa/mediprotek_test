import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { RequestWithUser } from '../interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import {
  AuthEventPatterns,
  LoginUserCommand,
  RefreshTokenCommand,
  RegisterUserCommand,
} from '@libs/shared-interfaces/src/lib/events/auth.events';

@Controller('auth')
export class AuthController {
  // RabbitMQ Event Handler
  @MessagePattern('user.events.deleted')
  async handleUserDeleted(@Payload() data: any) {
    console.log('📡 Received user deletion event:', data);
    try {
      await this.authService.deleteUser(data.id);
      console.log('✅ User deleted in auth-service:', data.id);
      return { success: true };
    } catch (error) {
      console.error('❌ Error handling user deletion in auth-service:', error);
      throw error;
    }
  }

  @MessagePattern('user.events.updated')
  async handleUserUpdated(@Payload() data: any) {
    console.log('📡 Received user update event:', data);
    try {
      await this.authService.updateUser(data.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role
      });
      console.log('✅ User updated in auth-service:', data.id);
      return { success: true };
    } catch (error) {
      console.error('❌ Error handling user update in auth-service:', error);
      throw error;
    }
  }

  @EventPattern('user.events')
  async handleUserEvent(@Payload() data: any) {
    console.log('📡 Received user event:', data);
    try {
      switch (data.type) {
        case 'user.created':
          // No necesitamos hacer nada ya que el usuario ya fue creado en el auth-service
          console.log('✅ User already exists in auth-service');
          break;
        default:
          console.warn('⚠️ Unknown event type:', data.type);
      }
    } catch (error) {
      console.error('❌ Error handling user event in auth-service:', error);
    }
  }
  constructor(private readonly authService: AuthService) {}

  // HTTP Endpoints
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
  @Post('register')
  async httpRegister(@Body() data: RegisterUserCommand) {
    return this.authService.register(data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async httpLogin(@Body() data: LoginUserCommand) {
    return this.authService.login(data);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async httpRefreshToken(@Body() data: RefreshTokenCommand) {
    return this.authService.refreshToken(data);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async httpLogout(@Request() req: RequestWithUser) {
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully' };
  }

  // RabbitMQ Message Patterns
  @MessagePattern(AuthEventPatterns.REGISTER_USER)
  async register(@Payload() data: RegisterUserCommand) {
    return this.authService.register(data);
  }

  @MessagePattern(AuthEventPatterns.LOGIN_USER)
  async login(@Payload() data: LoginUserCommand) {
    return this.authService.login(data);
  }

  @MessagePattern(AuthEventPatterns.REFRESH_TOKEN)
  async refreshToken(@Payload() data: RefreshTokenCommand) {
    return this.authService.refreshToken(data);
  }

  @MessagePattern(AuthEventPatterns.LOGOUT_USER)
  async logout(@Payload() data: { userId: string }) {
    return this.authService.logout(data.userId);
  }
}
