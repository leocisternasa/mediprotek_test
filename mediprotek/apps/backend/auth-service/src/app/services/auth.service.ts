import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import {
  LoginUserCommand,
  RefreshTokenCommand,
  RegisterUserCommand,
} from '@libs/shared-interfaces/src/lib/events/auth.events';
import { UserEventPatterns } from '@libs/shared-interfaces/src/lib/events/user.events';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject('USER_SERVICE') private userServiceClient: ClientProxy,
  ) {}

  async register(registerUserDto: RegisterUserCommand) {
    let savedUser;
    let tokens;

    try {
      console.log('📡 Starting registration for:', registerUserDto.email);
      
      // Primero creamos el usuario en el user-service y obtenemos su contraseña hasheada
      console.log('📡 Sending registration to user-service:', {
        email: registerUserDto.email,
        password: registerUserDto.password?.substring(0, 3) + '...'
      });

      const response = await this.userServiceClient.send(UserEventPatterns.CREATE_USER, registerUserDto).toPromise();
      console.log('✅ User created in user-service:', { 
        id: response.id, 
        email: response.email
      });

      // Usamos la misma contraseña sin hashear del registro original
      console.log('✅ Using original password for auth-service');

      // Usar el ID del user-service y la contraseña original para crear el usuario en auth-service
      const user = this.userRepository.create({
        ...registerUserDto,
        id: response.id,
        password: registerUserDto.password // Usamos la contraseña original
      });

      console.log('✅ User to be saved in auth-service:', {
        id: user.id,
        email: user.email
      });

      savedUser = await this.userRepository.save(user);
      console.log('✅ User created in auth-service:', { 
        id: savedUser.id, 
        email: savedUser.email,
        hasPassword: !!savedUser.password
      });

      // Generar tokens para el nuevo usuario
      tokens = await this.generateTokens(savedUser);
      await this.updateRefreshToken(savedUser.id, tokens.refreshToken);
    } catch (error) {
      console.error('❌ Error during user registration:', error);
      throw new Error('Failed to register user');
    }

    const { password, refreshToken, refreshTokenExpires, ...userResponse } = savedUser;

    return {
      statusCode: 201,
      message: 'User registered successfully',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: userResponse,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async login(loginUserDto: LoginUserCommand) {
    console.log('📡 Login attempt for:', loginUserDto.email, {
      providedPassword: loginUserDto.password?.substring(0, 3) + '...'
    });

    // Buscamos el usuario incluyendo el password
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: loginUserDto.email })
      .addSelect('user.password')
      .getOne();

    console.log('📡 User found:', { 
      id: user?.id, 
      email: user?.email,
      storedPassword: user?.password?.substring(0, 20) + '...'
    });
    
    if (!user) {
      console.warn('⚠️ User not found:', loginUserDto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      console.error('❌ No password stored for user:', loginUserDto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('📡 Comparing passwords:', {
      provided: loginUserDto.password?.substring(0, 3) + '...',
      stored: user.password?.substring(0, 20) + '...'
    });
    
    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
    console.log('📡 Password comparison result:', isPasswordValid);

    if (!isPasswordValid) {
      console.warn('⚠️ Invalid password for user:', loginUserDto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const { password, refreshToken, refreshTokenExpires, ...userResponse } = user;

    return {
      statusCode: 200,
      message: 'Login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: userResponse,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenCommand) {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: decoded.sub },
        select: ['id', 'email', 'role', 'firstName', 'lastName', 'createdAt', 'updatedAt', 'refreshToken', 'refreshTokenExpires'],
      });

      if (!user || !user.refreshToken || user.refreshToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      const { refreshToken: rt, refreshTokenExpires, ...userResponse } = user;

      return {
        statusCode: 200,
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: userResponse,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async updateUser(id: string, updateData: any) {
    console.log('📡 Updating user in auth-service:', { id, ...updateData });
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        console.warn('⚠️ User not found in auth-service, skipping update');
        return;
      }

      // No actualizamos campos sensibles como password o refreshToken
      const { password, refreshToken, refreshTokenExpires, ...safeUpdateData } = updateData;

      await this.userRepository.update(id, safeUpdateData);
      console.log('✅ User updated successfully in auth-service');
    } catch (error) {
      console.error('❌ Error updating user in auth-service:', error);
      throw error;
    }
  }

  async deleteUser(id: string) {
    console.log('📡 Deleting user in auth-service:', { id });
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        console.warn('⚠️ User not found in auth-service, skipping delete');
        return;
      }

      await this.userRepository.remove(user);
      console.log('✅ User deleted successfully in auth-service');
    } catch (error) {
      console.error('❌ Error deleting user in auth-service:', error);
      throw error;
    }
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, {
      refreshToken: undefined,
      refreshTokenExpires: undefined,
    });
  }

  private async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 días

    await this.userRepository.update(userId, {
      refreshToken,
      refreshTokenExpires,
    });
  }
}
