import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, Subject } from 'rxjs';
import { LoginDto, AuthResponse, User, UserResponse, AuthState } from '@mediprotek/shared-interfaces';
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
  private currentUserSubject = new BehaviorSubject<AuthState | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // Eventos de usuario
  private userEvents = new Subject<{ type: string; id: string; deletedAt?: string }>();
  userEvents$ = this.userEvents.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    console.log('🔵 AuthService initialized with API URL:', this.API_URL);
    this.initializeUser();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.userEvents$.subscribe(event => {
      console.log('📬 Received user event:', event);
      switch (event.type) {
        case 'user.deleted':
          this.handleUserDeleted(event.id);
          break;
        default:
          console.warn('⚠️ Unknown event type:', event.type);
      }
    });
  }

  private handleUserDeleted(userId: string): void {
    console.log('🗑 Handling user deleted event for:', userId);
    const currentUser = this.currentUserSubject.value;
    if (currentUser?.user.id === userId) {
      console.log('🗑 Current user was deleted, logging out...');
      this.clearStorage();
      this.router.navigate(['/login']);
    }
  }

  // Método público para emitir eventos
  emitUserEvent(event: { type: string; id: string; deletedAt?: string }): void {
    this.userEvents.next(event);
  }

  private initializeUser(): void {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('🟢 Restored user session:', { 
          email: userData.email
        });
        this.currentUserSubject.next({ user: userData });
      } catch (error) {
        console.error('🔴 Error parsing saved user:', error);
        localStorage.removeItem('userInfo');
      }
    }
  }

  login(loginDto: LoginDto): Observable<ApiResponse<AuthResponse>> {
    console.log('🟡 Making login request to:', `${this.API_URL}/login`);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, loginDto, {
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('🟢 Login response received:', {
          statusCode: response.statusCode,
          message: response.message,
          userId: response.data.user.id,
          email: response.data.user.email
        });
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        this.currentUserSubject.next({ user: response.data.user });
      }),
    );
  }

  register(registerDto: any): Observable<ApiResponse<AuthResponse>> {
    console.log('🟡 Making register request to:', `${this.API_URL}/register`);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/register`, registerDto, {
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('🟢 Register response received:', {
          statusCode: response.statusCode,
          message: response.message,
          userId: response.data.user.id,
          email: response.data.user.email,
        });
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        this.currentUserSubject.next({ user: response.data.user });
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

    return this.http.post<{ message: string }>(`${this.API_URL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.handleLogoutSuccess()),
      catchError(error => {
        console.error('🔴 Error during logout:', error);
        this.handleLogoutSuccess(); // Logout anyway on error
        return of({ message: 'Logged out successfully' }); // No propagar el error
      })
    );
  }

  clearStorage(): void {
    console.log('🟡 Clearing storage');
    localStorage.removeItem('userInfo');
    this.currentUserSubject.next(null);
  }

  private handleLogoutSuccess(): void {
    console.log('🟡 Logging out user');
    this.clearStorage(); // Usar el nuevo método
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
    console.log('✅ User logged out and redirected to login');
  }

  deleteAuthUser(userId: string): Observable<{ message: string }> {
    console.log('🗑 Deleting user from auth service:', userId);
    return this.http.delete<{ message: string }>(`${this.API_URL}/users/${userId}`).pipe(
      tap(response => {
        console.log('✅ User deleted from auth service:', response);
      })
    );
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

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    console.log('🟡 Making refresh token request');
    
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/refresh`, {}, {
      withCredentials: true
    }).pipe(
      tap(response => {
        console.log('🟢 Refresh token response received:', {
          statusCode: response.statusCode,
          message: response.message,
          userId: response.data.user.id,
          email: response.data.user.email
        });
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        this.currentUserSubject.next({ user: response.data.user });
      }),
      catchError(error => {
        console.error('🔴 Error refreshing token:', error);
        if (error.status === 401 || error.status === 403) {
          this.clearStorage();
        }
        throw error;
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
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      this.currentUserSubject.next({ user: updatedUser });
    }
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.currentUserSubject.value;
    console.log('🔵 Checking authentication:', isAuth);
    return isAuth;
  }

  getToken(): string | null {
    // Los tokens ahora están en las cookies, no necesitamos este método
    // pero lo mantenemos por compatibilidad
    return null;
  }

  getCurrentUser(): UserResponse | null {
    return this.currentUserSubject.value?.user || null;
  }
}
