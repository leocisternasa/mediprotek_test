import { User } from '../interfaces/user/user.interface';

export class AuthResponseDto {
  user: User;
  accessToken: string;
}
