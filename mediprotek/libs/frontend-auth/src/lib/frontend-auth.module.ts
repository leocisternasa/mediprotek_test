// libs/frontend-auth/src/lib/frontend-auth.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../../libs/frontend-ui/src/lib/material.module';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { authRoutes } from './auth.routes';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(authRoutes)
  ],
  declarations: [
    LoginComponent,
    DashboardComponent,
    UserDetailComponent
  ],
  exports: [
    LoginComponent,
    DashboardComponent,
    UserDetailComponent
  ],
  providers: [
    provideHttpClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
})
export class FrontendAuthModule {}
