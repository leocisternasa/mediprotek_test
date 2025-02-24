import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AuthEventPatterns,
  LoginUserCommand,
  RefreshTokenCommand,
  RegisterUserCommand,
} from '@libs/shared-interfaces/src/lib/events/auth.events';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  async register(registerDto: RegisterUserCommand) {
    try {
      const response = await firstValueFrom(
        this.authClient.send(AuthEventPatterns.REGISTER_USER, registerDto)
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('An error occurred');
    }
  }

  async login(loginDto: LoginUserCommand) {
    try {
      const response = await firstValueFrom(
        this.authClient.send(AuthEventPatterns.LOGIN_USER, loginDto)
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('An error occurred');
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenCommand) {
    try {
      const response = await firstValueFrom(
        this.authClient.send(AuthEventPatterns.REFRESH_TOKEN, refreshTokenDto)
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('An error occurred');
    }
  }

  async logout(userId: string) {
    try {
      await firstValueFrom(
        this.authClient.send(AuthEventPatterns.LOGOUT_USER, { userId })
      );
      return { message: 'Logged out successfully' };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('An error occurred');
    }
  }

  async getProfile(userId: string) {
    try {
      const response = await firstValueFrom(
        this.userClient.send('user.query.findOne', { id: userId })
      );
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('An error occurred');
    }
  }
}
