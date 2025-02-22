import { ApiProperty } from '@nestjs/swagger';
import { User } from '../interfaces/user/user.interface';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Usuario autenticado',
    type: 'object',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'usuario@ejemplo.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      createdAt: '2024-02-22T20:27:06.000Z',
      updatedAt: '2024-02-22T20:27:06.000Z',
    },
  })
  user: User;

  @ApiProperty({
    description: 'Token JWT para autenticación',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}
