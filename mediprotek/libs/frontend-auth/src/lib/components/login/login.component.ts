import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { Role } from '@mediprotek/shared-interfaces';

@Component({
  selector: 'mediprotek-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    console.log('Login Component Initialized');
  }

  openRegisterDialog() {
    const dialogRef = this.dialog.open(EditUserComponent, {
      width: '600px',
      data: {
        isNew: true,
        defaultRole: Role.ADMIN,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Usuario registrado exitosamente. ', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Attempting login with:', {
        email: this.loginForm.value.email,
        password: '********', // No logueamos la contraseña real
      });

      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: response => {
          console.log('Login successful:', {
            statusCode: response.statusCode,
            message: response.message,
            userId: response.data.user.id,
            email: response.data.user.email,
          });

          // Mostrar mensaje de éxito
          this.snackBar.open(response.message, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });

          this.router.navigate(['/dashboard']);
        },
        error: error => {
          console.error('Login failed:', error.error?.message || error.message);
          this.loading = false;
          this.snackBar.open(error.error?.message || 'Error al iniciar sesión', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    } else {
      console.warn('Form validation failed:', {
        emailErrors: this.loginForm.get('email')?.errors,
        passwordErrors: this.loginForm.get('password')?.errors,
      });
    }
  }
}
