import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get, Request, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
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
  async httpLogin(
    @Body() data: LoginUserCommand,
    @Res({ passthrough: true }) response: ExpressResponse
  ) {
    const auth = await this.authService.login(data);

    // Configurar cookie para access token
    response.cookie('access_token', auth.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutos
    });

    // Configurar cookie para refresh token
    response.cookie('refresh_token', auth.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    // No enviar tokens en la respuesta
    const { accessToken, refreshToken, ...userInfo } = auth.data;
    return { statusCode: HttpStatus.OK, message: 'Login successful', data: userInfo };
  }



  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async httpRefreshToken(
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: ExpressResponse
  ) {
    const tokenFromCookie = request.cookies['refresh_token'];
    if (!tokenFromCookie) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      const auth = await this.authService.refreshToken({ refreshToken: tokenFromCookie });
      
      response.cookie('access_token', auth.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutos
      });

      // No enviar tokens en la respuesta
      const { accessToken, refreshToken, ...userInfo } = auth.data;
      return { statusCode: HttpStatus.OK, message: 'Token refreshed', data: userInfo };
    } catch (error) {
      // Si hay error, limpiar las cookies
      response.clearCookie('access_token');
      response.clearCookie('refresh_token');
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async httpLogout(
    @Request() req: RequestWithUser,
    @Res({ passthrough: true }) response: ExpressResponse
  ) {
    await this.authService.logout(req.user.id);
    
    // Limpiar cookies
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    
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
