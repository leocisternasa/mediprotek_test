import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, switchMap, catchError, of } from 'rxjs';
import { environment } from '../../../../../apps/frontend/src/environments/environment';
import { User, UserPaginatedResponse, UserFilters } from '@mediprotek/shared-interfaces';
import { AuthService } from './auth.service';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL = `${environment.userApiUrl}/api/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    console.log('🟡 UserService initialized with API URL:', this.API_URL);
  }

  getUsers(filters: UserFilters = {}): Observable<UserPaginatedResponse> {
    console.log('📥 Getting users with filters:', filters);
    let params = new HttpParams();

    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.page !== undefined) {
      params = params.set('page', filters.page.toString());
    }
    if (filters.limit !== undefined) {
      params = params.set('limit', filters.limit.toString());
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }

    return this.http.get<UserPaginatedResponse>(this.API_URL, { params, withCredentials: true });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`, { withCredentials: true });
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.API_URL, user, { withCredentials: true });
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, user, { withCredentials: true });
  }

  deleteUser(id: string): Observable<{ message: string }> {
    console.log('🗑 Starting user deletion process for:', id);
    
    // Primero intentamos eliminar del auth service
    return this.authService.deleteAuthUser(id).pipe(
      // Si la eliminación en auth es exitosa o retorna 404 o 401, continuamos con user service
      catchError(error => {
        if (error.status === 404 || error.status === 401) {
          console.log('✅ User not found or unauthorized in auth service, continuing with user service');
          return of({ message: 'Continuing with user service' });
        }
        throw error;
      }),
      // Luego eliminamos del user service
      switchMap(() => {
        console.log('🗑 Now deleting from user service:', id);
        return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`, { withCredentials: true });
      }),
      // Si hay error 401 en el user service, intentamos refrescar el token y reintentar
      catchError(error => {
        if (error.status === 401) {
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              console.log('🗑 Retrying delete after token refresh');
              return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`, { withCredentials: true });
            })
          );
        }
        throw error;
      }),
      tap(response => {
        console.log('✅ User successfully deleted:', response);
      }),
      catchError(error => {
        console.error('🔴 Error in deletion process:', error);
        throw error;
      })
    );
  }

  deleteUsers(ids: string[]): Observable<{ message: string }> {
    console.log('🗑 Starting bulk deletion for users:', ids);
    return this.http.delete<{ message: string }>(`${this.API_URL}`, { 
      body: ids,
      withCredentials: true 
    }).pipe(
      tap(response => {
        console.log('✅ Users successfully deleted:', response);
      }),
      catchError(error => {
        if (error.status === 401) {
          console.log('🟡 Token expired, trying to refresh...');
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              console.log('🗑 Retrying bulk deletion after token refresh');
              return this.http.delete<{ message: string }>(`${this.API_URL}`, { 
                body: ids,
                withCredentials: true 
              });
            })
          );
        }
        console.error('🔴 Error in bulk deletion:', error);
        throw error;
      })
    );
  }
}
