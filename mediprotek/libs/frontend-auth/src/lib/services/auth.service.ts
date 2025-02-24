import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { LoginDto, AuthResponse, User, UserResponse } from '@mediprotek/shared-interfaces';
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
          email: userData.user?.email,
          token: !!userData.accessToken
        });
        this.currentUserSubject.next(userData);
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
        // Solo guardamos los datos de autenticación, no la respuesta completa
        localStorage.setItem('currentUser', JSON.stringify(response.data));
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
        // Solo guardamos los datos de autenticación, no la respuesta completa
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        this.currentUserSubject.next(response.data);
      }),
    );
  }

  logout(): Observable<{ message: string }> {
    console.log('🟡 Making logout request to:', `${this.API_URL}/logout`);
    const currentUser = this.currentUserSubject.value;
    
    if (!currentUser) {
      this.handleLogoutSuccess();
      return of({ message: 'Logged out successfully' });
    }

    return this.http.post<{ message: string }>(`${this.API_URL}/logout`, {}).pipe(
      tap(() => this.handleLogoutSuccess()),
      catchError(error => {
        console.error('🔴 Error during logout:', error);
        this.handleLogoutSuccess(); // Logout anyway on error
        throw error;
      })
    );
  }

  private handleLogoutSuccess(): void {
    console.log('🟡 Logging out user');
    localStorage.clear(); // Limpiamos todo el localStorage
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
    console.log('✅ User logged out and redirected to login');
  }

  updateUser(userId: string, updateData: Partial<User>): Observable<User> {
    console.log('🟡 Updating user:', { userId, ...updateData });
    return this.http.put<User>(`${this.API_URL}/users/${userId}`, updateData).pipe(
      tap(updatedUser => {
        console.log('✅ User updated successfully:', updatedUser);
        // Actualizar el usuario en el estado local
        const currentUser = this.currentUserSubject.value;
        if (currentUser && currentUser.user.id === userId) {
          this.currentUserSubject.next({
            ...currentUser,
            user: { ...currentUser.user, ...updateData }
          });
        }
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    console.log('🟡 Making refresh token request');
    const currentUser = this.currentUserSubject.value;
    
    if (!currentUser?.refreshToken) {
      console.error('🔴 No refresh token available');
      this.handleLogoutSuccess();
      throw new Error('No refresh token available');
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, {
      refreshToken: currentUser.refreshToken
    }).pipe(
      tap(response => {
        console.log('🟢 Refresh token response received');
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.currentUserSubject.next(response);
      })
    );
  }

  handleUserDeletion(): void {
    console.log('🟡 Handling user deletion');
    this.logout();
  }

  updateCurrentUser(updatedUser: UserResponse): void {
    console.log('🟡 Updating current user:', updatedUser.email);
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedAuthResponse = {
        ...currentUser,
        user: updatedUser
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedAuthResponse));
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
    const currentUser = this.currentUserSubject.value;
    const token = currentUser?.accessToken;

    if (!token) {
      console.log('🔴 No token found');
      return null;
    }

    console.log('🟢 Token found');
    return token;
  }

  getCurrentUser(): UserResponse | null {
    return this.currentUserSubject.value?.user || null;
  }
}
