import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap, filter, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<boolean | null> = new BehaviorSubject<
    boolean | null
  >(null);
  constructor(private authService: AuthService, private router: Router) {}

  private readonly TOKEN_REFRESH_THRESHOLD = 60000; // 1 minuto en milisegundos

  private shouldRefreshToken(): boolean {
    const lastRefresh = this.authService.getLastTokenRefresh();
    const timeSinceLastRefresh = Date.now() - lastRefresh;
    const shouldRefresh = timeSinceLastRefresh > 2 * 60 * 1000; // 2 minutos

    if (shouldRefresh) {
      console.log(
        '🕒 Time since last refresh:',
        Math.round(timeSinceLastRefresh / 1000),
        'seconds',
      );
      console.log('📅 Last refresh:', new Date(lastRefresh).toISOString());
      console.log('📅 Current time:', new Date().toISOString());
    }

    return shouldRefresh;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('📥 Intercepting request to:', request.url);

    // No interceptar las peticiones de refresh token
    if (request.url.includes('/auth/refresh')) {
      return next.handle(request.clone({ withCredentials: true }));
    }

    // Asegurarnos que todas las peticiones incluyan las cookies
    request = request.clone({
      withCredentials: true,
    });

    // Verificar si necesitamos refrescar el token proactivamente
    if (this.shouldRefreshToken() && !this.isRefreshing) {
      console.log('🔄 Proactively refreshing token...');
      return this.refreshToken().pipe(
        switchMap(() => {
          console.log('🟢 Token refreshed proactively, proceeding with request');
          // Actualizar el timestamp del último refresh
          this.authService.updateLastTokenRefresh();
          return next.handle(request);
        }),
        catchError(error => {
          console.error('🔴 Proactive token refresh failed:', error);
          // Si el error es de autenticación, intentar la petición original
          if (error.status === 401 || error.status === 403) {
            return next.handle(request).pipe(
              catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                  return this.handle401Error(request, next);
                }
                return throwError(() => err);
              }),
            );
          }
          return throwError(() => error);
        }),
      );
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.log('🔒 Token expired, attempting refresh...');
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private refreshToken(): Observable<any> {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authService.refreshToken().pipe(
      tap(response => {
        console.log('🟢 Token refresh successful:', response);
        this.isRefreshing = false;
        this.refreshTokenSubject.next(true);
      }),
      catchError(error => {
        console.error('🔴 Token refresh failed:', error);
        this.isRefreshing = false;
        this.refreshTokenSubject.next(false);
        if (error.status === 401 || error.status === 403) {
          this.authService.clearStorage();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      }),
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(response => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);
          console.log('🟢 Token refreshed successfully');
          return next.handle(request);
        }),
        catchError(error => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(false);
          console.error('🔴 Token refresh failed:', error);

          if (error.status === 401 || error.status === 403) {
            console.log('🔒 Authentication error, logging out...');
            this.authService.clearStorage();
            this.router.navigate(['/login']);
          }

          return throwError(() => error);
        }),
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        if (token) {
          console.log('🔄 Retrying request after token refresh');
          return next.handle(request);
        }
        console.log('🔴 Token refresh failed, redirecting to login');
        this.router.navigate(['/login']);
        return throwError(() => new Error('Token refresh failed'));
      }),
    );
  }
}
