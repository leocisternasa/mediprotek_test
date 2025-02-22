export interface JwtPayload {
  sub: string; // user uuid
  email: string;
  firstName: string;
  lastName: string;
  iat?: number; // issued at
  exp?: number; // expiration
}
