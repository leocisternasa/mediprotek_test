import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('📥 Intercepting request to:', request.url);
    const token = this.authService.getToken();
    console.log('🔑 Current token:', token ? 'Present' : 'Missing');

    if (token) {
      const authHeader = `Bearer ${token}`;
      console.log('🔑 Adding JWT token to request');
      request = request.clone({
        setHeaders: {
          Authorization: authHeader
        }
      });
      console.log('🟢 Request headers:', {
        url: request.url,
        method: request.method,
        authHeader: request.headers.get('Authorization')
      });
    } else {
      console.warn('⚠️ No token available for request to:', request.url);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.log('🚫 Token expired or invalid');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      }),
    );
  }
}
