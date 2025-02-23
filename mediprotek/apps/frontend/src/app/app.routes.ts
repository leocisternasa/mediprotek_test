import { Route } from '@angular/router';
import {
  LoginComponent,
  DashboardComponent,
  UserDetailComponent
} from '@mediprotek/frontend-auth';
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
    component: UserDetailComponent,
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
