import { Route } from '@angular/router';
import { LoginComponent } from '@mediprotek/frontend-auth';
import { DashboardComponent } from '@mediprotek/frontend-auth';
import { ProfileComponent } from '@libs/frontend-auth/src/lib/components/profile/profile.component';
import { AuthGuard } from '@mediprotek/frontend-auth';

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
    path: 'users/:id',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
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
