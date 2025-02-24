import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, switchMap, catchError, of } from 'rxjs';
import { environment } from '../../../../../apps/frontend/src/environments/environment';
import { User } from '@mediprotek/shared-interfaces';
import { AuthService } from './auth.service';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface UserPaginatedResponse {
  users: User[];
  total: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

export interface UserFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
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

    return this.http.get<UserPaginatedResponse>(this.API_URL, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.API_URL, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, user);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    console.log('🗑 Starting user deletion process for:', id);
    
    // Primero intentamos eliminar del auth service
    return this.authService.deleteAuthUser(id).pipe(
      // Si la eliminación en auth es exitosa o retorna 404, continuamos con user service
      catchError(error => {
        if (error.status === 404) {
          console.log('✅ User not found in auth service, continuing with user service');
          return of({ message: 'User not found in auth service' });
        }
        throw error;
      }),
      // Luego eliminamos del user service
      switchMap(() => {
        console.log('🗑 Now deleting from user service:', id);
        return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
      }),
      tap(response => {
        console.log('✅ User successfully deleted from both services:', response);
      }),
      catchError(error => {
        console.error('🔴 Error in deletion process:', error);
        throw error;
      })
    );
  }

  deleteUsers(ids: string[]): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}`, { body: ids });
  }
}
