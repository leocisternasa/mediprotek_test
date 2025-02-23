// libs/frontend-auth/src/lib/frontend-auth.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { MaterialModule } from '../../../../libs/frontend-ui/src/lib/material.module';
import { LoginComponent } from './components/login/login.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  declarations: [LoginComponent],
  exports: [LoginComponent],
  providers: [provideHttpClient()],
})
export class FrontendAuthModule {}
