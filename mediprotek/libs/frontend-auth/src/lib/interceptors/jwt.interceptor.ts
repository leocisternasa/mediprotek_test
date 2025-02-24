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
        if (error.status === 401 && !request.url.includes('/auth/refresh')) {
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
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);
          // Las cookies se actualizan automáticamente
          return next.handle(request);
        }),
        catchError((error) => {
          this.isRefreshing = false;
          console.error('🔴 Token refresh failed:', error);
          this.authService.logout();
          this.router.navigate(['/login']);
          return throwError(() => error);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(refreshed => refreshed),
      take(1),
      switchMap(() => next.handle(request))
    );
  }


}
