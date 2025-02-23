import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginDto, AuthResponse, User } from '@mediprotek/shared-interfaces';
import { environment } from '../../../../../apps/frontend/src/environments/environment';
import { Router } from '@angular/router';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    console.log('🔵 AuthService initialized with API URL:', this.API_URL);
    this.initializeUser();
  }

  private initializeUser(): void {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('🟢 Restored user session:', { 
          email: userData.data?.user?.email,
          token: !!userData.data?.accessToken
        });
        // Extraer los datos de la respuesta
        this.currentUserSubject.next(userData.data);
      } catch (error) {
        console.error('🔴 Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(loginDto: LoginDto): Observable<ApiResponse<AuthResponse>> {
    console.log('🟡 Making login request to:', `${this.API_URL}/login`);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, loginDto).pipe(
      tap(response => {
        console.log('🟢 Login response received:', {
          statusCode: response.statusCode,
          message: response.message,
          userId: response.data.user.id,
          email: response.data.user.email,
          token: response.data.accessToken
        });
        // Guardar la respuesta completa para mantener consistencia
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.currentUserSubject.next(response.data);
      }),
    );
  }

  register(registerDto: any): Observable<ApiResponse<AuthResponse>> {
    console.log('🟡 Making register request to:', `${this.API_URL}/register`);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/register`, registerDto).pipe(
      tap(response => {
        console.log('🟢 Register response received:', {
          statusCode: response.statusCode,
          message: response.message,
          userId: response.data.user.id,
          email: response.data.user.email,
        });
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.currentUserSubject.next(response.data);
      }),
    );
  }

  logout(): void {
    console.log('🟡 Logging out user');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  handleUserDeletion(): void {
    console.log('🟡 Handling user deletion');
    this.logout();
  }

  updateCurrentUser(updatedUser: User): void {
    console.log('🟡 Updating current user:', updatedUser.email);
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedAuthResponse = {
        ...currentUser,
        user: updatedUser
      };
      localStorage.setItem('currentUser', JSON.stringify({
        data: updatedAuthResponse,
        statusCode: 200,
        message: 'User updated successfully'
      }));
      this.currentUserSubject.next(updatedAuthResponse);
    }
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.currentUserSubject.value?.accessToken;
    console.log('🔵 Checking authentication:', isAuth);
    return isAuth;
  }

  getToken(): string | null {
    console.log('🔑 Getting token from current user...');
    const token = this.currentUserSubject.value?.accessToken;
    if (!token) {
      console.log('🔴 No token found');
      return null;
    } else {
      console.log('🟢 Token found');
    }
    return token || null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value?.user || null;
  }
}
