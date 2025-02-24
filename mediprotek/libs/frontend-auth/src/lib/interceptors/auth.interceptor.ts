import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private tokenExpirationTimer: any;

  constructor(private authService: AuthService) {
    this.setupRefreshTimer();
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No interceptamos las llamadas al endpoint de refresh
    if (request.url.includes('/refresh')) {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
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
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);
          this.setupRefreshTimer();
          // El token ya está actualizado en el AuthService
          return next.handle(request);
        }),
        catchError(error => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => error);
        }),
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => next.handle(request)),
    );
  }

  private setupRefreshTimer() {
    // Limpiar el timer existente si hay uno
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    // Calcular cuando expira el token (15 minutos antes de la expiración real)
    const token = this.authService.getAccessToken();
    if (token) {
      const tokenData = this.parseJwt(token);
      if (tokenData && tokenData.exp) {
        const expiresIn = tokenData.exp * 1000 - Date.now() - 15 * 60 * 1000; // 15 minutos antes
        if (expiresIn > 0) {
          this.tokenExpirationTimer = setTimeout(() => {
            this.authService.refreshToken();
          }, expiresIn);
        }
      }
    }
  }

  private parseJwt(token: string) {
    if (!token) {
      return null;
    }
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  }
}
