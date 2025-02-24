import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('📥 Intercepting request to:', request.url);

    // No interceptar las peticiones de refresh token
    if (request.url.includes('/auth/refresh')) {
      return next.handle(request.clone({ withCredentials: true }));
    }

    // Asegurarnos que todas las peticiones incluyan las cookies
    request = request.clone({
      withCredentials: true
    });

    console.log('🟢 Request configured with credentials:', {
      url: request.url,
      method: request.method,
      withCredentials: request.withCredentials
    });

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.log('🔒 Token expired, attempting refresh...');
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(false);

      return this.authService.refreshToken().pipe(
        switchMap((response) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);
          console.log('🟢 Token refreshed successfully');
          // Las cookies se actualizan automáticamente
          return next.handle(request);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(false);
          console.error('🔴 Token refresh failed:', error);
          
          // Solo hacer logout si el error es de autenticación
          if (error.status === 401 || error.status === 403) {
            console.log('🔒 Authentication error, logging out...');
            this.authService.clearStorage();
            this.router.navigate(['/login']);
          }
          
          return throwError(() => error);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(refreshed => refreshed),
      take(1),
      switchMap(() => {
        console.log('🔄 Retrying request after token refresh');
        return next.handle(request);
      })
    );
  }


}
