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
import { Role } from '@shared/enums/role.enum';

@Component({
  selector: 'mediprotek-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
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
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
    });

    console.log('Register Component Initialized');
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Attempting registration with:', {
        email: this.registerForm.value.email,
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        password: '********',
      });

      this.loading = true;
      const registerData = {
        ...this.registerForm.value,
        role: Role.USER, // Asignar rol por defecto
      };

      this.authService.register(registerData).subscribe({
        next: response => {
          console.log('Registration successful:', {
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
          console.error('Registration failed:', error.error?.message || error.message);
          this.loading = false;
          this.snackBar.open(error.error?.message || 'Error al registrar usuario', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    } else {
      console.warn('Form validation failed:', {
        emailErrors: this.registerForm.get('email')?.errors,
        passwordErrors: this.registerForm.get('password')?.errors,
        firstNameErrors: this.registerForm.get('firstName')?.errors,
        lastNameErrors: this.registerForm.get('lastName')?.errors,
      });
    }
  }
}
