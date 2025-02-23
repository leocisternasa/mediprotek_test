import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginDto, AuthResponse, User } from '@mediprotek/shared-interfaces';
import { environment } from '../../../../../apps/frontend/src/environments/environment';

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
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('🔵 AuthService initialized with API URL:', this.API_URL);
    this.initializeUser();
  }

  private initializeUser(): void {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('🟢 Restored user session:', { email: user.data.user.email });
        this.currentUserSubject.next(user.data);
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
        });
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
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.currentUserSubject.value?.accessToken;
    console.log('🔵 Checking authentication:', isAuth);
    return isAuth;
  }

  getToken(): string | null {
    return this.currentUserSubject.value?.accessToken || null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value?.user || null;
  }

  updateCurrentUser(user: User): void {
    const currentValue = this.currentUserSubject.value;
    if (currentValue) {
      const updatedValue = { ...currentValue, user };
      localStorage.setItem('currentUser', JSON.stringify(updatedValue));
      this.currentUserSubject.next(updatedValue);
    }
  }
}
