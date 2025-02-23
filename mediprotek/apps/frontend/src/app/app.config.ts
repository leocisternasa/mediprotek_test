import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from '@libs/frontend-auth/src/lib/services/auth.service';
import { Router } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const authService = inject(AuthService);
          const router = inject(Router);
          const token = authService.getToken();

          if (token) {
            console.log('🔑 Adding JWT token to request');
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
          }

          return next(req);
        }
      ])
    ),
  ],
};
