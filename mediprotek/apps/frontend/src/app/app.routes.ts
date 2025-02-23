import { Route } from '@angular/router';
import { LoginComponent } from '@libs/frontend-auth/src/lib/components/login/login.component';
import { DashboardComponent } from '@libs/frontend-auth/src/lib/components/dashboard/dashboard.component';
import { AuthGuard } from '@libs/frontend-auth/src/lib/guards/auth.guard';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
