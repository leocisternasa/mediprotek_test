import { User } from '../user/user.interface';

export interface AuthResponse {
  user: User;
  accessToken: string;
}
