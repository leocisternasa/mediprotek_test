import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../apps/frontend/src/environments/environment';
import { User } from '@mediprotek/shared-interfaces';

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

  constructor(private http: HttpClient) {
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
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }

  deleteUsers(ids: string[]): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}`, { body: ids });
  }
}
