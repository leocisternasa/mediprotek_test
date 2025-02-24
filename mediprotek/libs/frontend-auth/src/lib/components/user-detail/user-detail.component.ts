import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User, Role } from '@mediprotek/shared-interfaces';

@Component({
  selector: 'mediprotek-user-detail',
  template: `
    <div class="container" *ngIf="user; else loading">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <div class="header-content">
              <h1>{{ isCurrentUser ? 'Mi Perfil' : 'Detalle de Usuario' }}</h1>
              <mat-chip-set>
                <mat-chip [color]="user.role === Role.ADMIN ? 'accent' : 'primary'" selected>
                  {{ user.role === Role.ADMIN ? 'Administrador' : 'Usuario' }}
                </mat-chip>
              </mat-chip-set>
            </div>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Nombre</mat-label>
                <input
                  matInput
                  formControlName="firstName"
                  placeholder="Nombre"
                  [readonly]="!editingField['firstName']"
                />
                <button
                  mat-icon-button
                  matSuffix
                  (click)="toggleEdit('firstName')"
                  type="button"
                  [disabled]="editingField['firstName']"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  *ngIf="editingField['firstName']"
                  mat-icon-button
                  matSuffix
                  (click)="confirmEdit('firstName')"
                  type="button"
                >
                  <mat-icon color="primary">check_circle</mat-icon>
                </button>
                <mat-error *ngIf="userForm.get('firstName')?.hasError('required')">
                  El nombre es requerido
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Apellido</mat-label>
                <input
                  matInput
                  formControlName="lastName"
                  placeholder="Apellido"
                  [readonly]="!editingField['lastName']"
                />
                <button
                  mat-icon-button
                  matSuffix
                  (click)="toggleEdit('lastName')"
                  type="button"
                  [disabled]="editingField['lastName']"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  *ngIf="editingField['lastName']"
                  mat-icon-button
                  matSuffix
                  (click)="confirmEdit('lastName')"
                  type="button"
                >
                  <mat-icon color="primary">check_circle</mat-icon>
                </button>
                <mat-error *ngIf="userForm.get('lastName')?.hasError('required')">
                  El apellido es requerido
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                formControlName="email"
                placeholder="Email"
                type="email"
                [readonly]="!editingField['email']"
              />
              <button
                mat-icon-button
                matSuffix
                (click)="toggleEdit('email')"
                type="button"
                [disabled]="editingField['email']"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                *ngIf="editingField['email']"
                mat-icon-button
                matSuffix
                (click)="confirmEdit('email')"
                type="button"
              >
                <mat-icon color="primary">check_circle</mat-icon>
              </button>
              <mat-error *ngIf="userForm.get('email')?.hasError('required')">
                El email es requerido
              </mat-error>
              <mat-error *ngIf="userForm.get('email')?.hasError('email')">
                Por favor ingrese un email válido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                formControlName="password"
                [type]="editingField['password'] ? 'text' : 'password'"
                placeholder="Dejar en blanco para mantener la actual"
                [readonly]="!editingField['password']"
              />
              <button
                mat-icon-button
                matSuffix
                (click)="toggleEdit('password')"
                type="button"
                [disabled]="editingField['password']"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                *ngIf="editingField['password']"
                mat-icon-button
                matSuffix
                (click)="confirmEdit('password')"
                type="button"
              >
                <mat-icon color="primary">check_circle</mat-icon>
              </button>
              <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
                La contraseña debe tener al menos 6 caracteres
              </mat-error>
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button type="button" (click)="goBack()">
            {{ isEditing ? 'Volver sin guardar cambios' : 'Volver' }}
          </button>
          <button
            mat-raised-button
            color="primary"
            (click)="onSubmit()"
            *ngIf="isEditing"
            [disabled]="!userForm.valid || !userForm.dirty"
          >
            Guardar Cambios
          </button>
        </mat-card-actions>
      </mat-card>
    </div>

    <ng-template #loading>
      <div class="loading-container">
        <mat-spinner></mat-spinner>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
      }
      .header-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .form-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .form-row mat-form-field {
        flex: 1;
      }
      .full-width {
        width: 100%;
      }
      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 400px;
      }
      mat-card-header {
        margin-bottom: 2rem;
      }
      mat-card-actions {
        padding: 1rem;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
  ],
})
export class UserDetailComponent implements OnInit {
  editingField: { [key: string]: boolean } = {
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  };

  get isEditing(): boolean {
    return Object.values(this.editingField).some(value => value);
  }
  user: User | null = null;
  userForm!: FormGroup;
  isCurrentUser = false;
  Role = Role;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.initForm();

    const userId = this.route.snapshot.paramMap.get('id');
    const currentUser = this.authService.getCurrentUser();

    if (!userId || !currentUser) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.isCurrentUser = userId === currentUser.id;

    // Si es su propio perfil, redirigir a /profile
    if (this.isCurrentUser) {
      this.router.navigate(['/profile']);
      return;
    }

    // Si no es admin y no es su propio perfil, redirigir a dashboard
    if (!this.isCurrentUser && currentUser.role !== Role.ADMIN) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadUser(userId);
  }

  private initForm() {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
    });
  }

  private loadUser(userId: string) {
    this.userService.getUserById(userId).subscribe({
      next: response => {
        this.user = response;
        this.userForm.patchValue({
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
        });
      },
      error: (error: any) => {
        console.error('Error loading user:', error);
        this.snackBar.open('Error al cargar el usuario', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/dashboard']);
      },
    });
  }

  onSubmit() {
    if (this.userForm.valid && this.user && this.isEditing) {
      const formValue = this.userForm.value;
      const updateData = {
        ...formValue,
        role: this.user.role, // Mantener el rol actual
      };

      // Si no se ingresó contraseña, no enviarla
      if (!formValue.password) {
        delete updateData.password;
      }

      this.userService.updateUser(this.user.id, updateData).subscribe({
        next: response => {
          this.snackBar.open('Usuario actualizado con éxito', 'Cerrar', {
            duration: 3000,
          });

          // Si el usuario actualizó su propio perfil, actualizar el currentUser
          if (this.isCurrentUser) {
            this.authService.updateCurrentUser(response);
          }
          this.router.navigate(['/dashboard']);

          this.userForm.markAsPristine();
        },
        error: (error: any) => {
          console.error('Error updating user:', error);
          this.snackBar.open('Error al actualizar usuario', 'Cerrar', {
            duration: 3000,
          });
        },
      });
    }
  }

  goBack() {
    if (this.isEditing) {
      // Si hay cambios sin guardar, revertir el formulario al estado original
      this.userForm.reset({
        firstName: this.user?.firstName,
        lastName: this.user?.lastName,
        email: this.user?.email,
      });
      // Desactivar todos los campos de edición
      Object.keys(this.editingField).forEach(key => {
        this.editingField[key] = false;
      });
    }
    this.router.navigate(['/dashboard']);
  }

  toggleEdit(field: string) {
    // Activar la edición del campo si no está activo
    if (!this.editingField[field]) {
      this.editingField[field] = true;
    }
  }

  confirmEdit(field: string) {
    // Validar el campo antes de confirmar
    const control = this.userForm.get(field);
    if (control?.valid) {
      this.editingField[field] = false;
    } else {
      this.snackBar.open('Por favor corrige los errores antes de confirmar', 'Cerrar', {
        duration: 3000,
      });
    }
  }
}
