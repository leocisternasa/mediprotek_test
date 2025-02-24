import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { User, Role } from '@mediprotek/shared-interfaces';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'mediprotek-edit-user',
  template: `
    <h2 mat-dialog-title>{{ isNewUser ? 'Crear Usuario' : 'Editar Usuario' }}</h2>
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-container">
          <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="firstName" placeholder="Ingrese nombre" />
            <mat-error *ngIf="userForm.get('firstName')?.errors?.['required']">
              El nombre es requerido
            </mat-error>
            <mat-error *ngIf="userForm.get('firstName')?.errors?.['minlength']">
              El nombre debe tener al menos 2 caracteres
            </mat-error>
            <mat-error *ngIf="userForm.get('firstName')?.errors?.['pattern']">
              El nombre debe tener solo letras
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Apellido</mat-label>
            <input matInput formControlName="lastName" placeholder="Ingrese apellido" />
            <mat-error *ngIf="userForm.get('lastName')?.errors?.['required']">
              El apellido es requerido
            </mat-error>
            <mat-error *ngIf="userForm.get('lastName')?.errors?.['minlength']">
              El apellido debe tener al menos 2 caracteres
            </mat-error>
            <mat-error *ngIf="userForm.get('lastName')?.errors?.['pattern']">
              El apellido debe tener solo letras
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" placeholder="Ingrese email" type="email" />
            <mat-error *ngIf="userForm.get('email')?.errors?.['required']">
              El email es requerido
            </mat-error>
            <mat-error *ngIf="userForm.get('email')?.errors?.['email']">
              Ingrese un email válido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Contraseña</mat-label>
            <input
              matInput
              formControlName="password"
              [type]="hidePassword ? 'password' : 'text'"
              placeholder="Ingrese contraseña"
            />
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon class="icon"><</mat-icon>
            </button>
            <mat-error *ngIf="userForm.get('password')?.errors?.['required'] && isNewUser">
              La contraseña es requerida
            </mat-error>
            <mat-error *ngIf="userForm.get('password')?.errors?.['minlength']">
              La contraseña debe tener al menos 6 caracteres.
            </mat-error>
            <mat-error *ngIf="userForm.get('password')?.errors?.['pattern']">
              La contraseña debe tener al menos una mayúscula y un caracter especial (!#$%)
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="isAdmin && !isSelfEdit">
            <mat-label>Rol</mat-label>
            <mat-select formControlName="role">
              <mat-option [value]="Role.ADMIN">Administrador</mat-option>
              <mat-option [value]="Role.USER">Usuario</mat-option>
            </mat-select>
            <mat-error *ngIf="userForm.get('role')?.errors?.['required']">
              El rol es requerido
            </mat-error>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="userForm.invalid || isLoading"
        >
          <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
          <span *ngIf="!isLoading">{{ isNewUser ? 'Crear' : 'Actualizar' }}</span>
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 35px;
        padding: 24px 0;
        min-height: 400px;
        height: 100%;
      }
      mat-form-field {
        width: 100%;
      }
      mat-error {
        background-color: white !important;
        opacity: 1 !important;
        padding: 4px 0;
        margin-top: 4px;
        color: #f44336 !important;
      }
      ::ng-deep {
        .mat-select-panel {
          background-color: white !important;
          opacity: 1 !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
        .mat-option {
          background-color: white !important;
          opacity: 1 !important;
        }
      }
      ::ng-deep .mat-select-panel {
        background-color: white !important;
        opacity: 1 !important;
      }
      .mat-option-text {
        opacity: 1 !important;
        color: rgba(0, 0, 0, 0.87) !important;
      }
      .mat-form-field-wrapper {
        margin-bottom: 16px !important;
        padding-bottom: 16px !important;
      }
      ::ng-deep .mat-error {
        background-color: white !important;
        opacity: 1 !important;
        padding: 4px 0;
        margin-top: 4px;
      }
      ::ng-deep .mat-form-field-subscript-wrapper {
        margin-top: 4px !important;
        padding-bottom: 4px !important;
      }
      ::ng-deep .mat-select-panel {
        z-index: 1000 !important;
      }
      ::ng-deep .mat-form-field-wrapper {
        margin-bottom: 16px !important;
        padding-bottom: 16px !important;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
})
export class EditUserComponent implements OnInit {
  isNewUser = false;
  isLoading = false;
  hidePassword = true;
  userForm!: FormGroup;
  isAdmin = false;
  isSelfEdit = false;
  Role = Role;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditUserComponent>,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User; isNew?: boolean; defaultRole?: Role },
  ) {
    this.isNewUser = data.isNew || false;
  }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === Role.ADMIN;
    this.isSelfEdit = currentUser?.id === this.data.user?.id;
    this.initForm();

    if (!this.isNewUser && this.data.user) {
      this.userForm.patchValue({
        firstName: this.data.user.firstName,
        lastName: this.data.user.lastName,
        email: this.data.user.email,
        role: this.data.user.role,
      });

      // La contraseña no es requerida en modo edición
      this.userForm.get('password')?.setValidators(null);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  private initForm() {
    this.userForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z]+$/),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z]+$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).*$/),
        ],
      ],
      role: [Role.ADMIN, [Validators.required]],
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.isLoading = true;
    const formData = this.userForm.value;

    const userData = {
      ...formData,
      role: formData.role || Role.ADMIN,
    };

    if (!this.isNewUser && !userData.password) {
      delete userData.password;
    }

    // Si no es admin o está editando su propio perfil, no puede cambiar el rol
    if (!this.isAdmin || this.isSelfEdit) {
      delete userData.role;
    }

    if (this.isNewUser) {
      // Asegurar que el rol sea ADMIN
      userData.role = Role.ADMIN;

      this.authService.register(userData).subscribe({
        next: () => {
          const loginData = {
            email: userData.email,
            password: userData.password,
          };

          this.authService.login(loginData).subscribe({
            next: () => {
              this.isLoading = false;
              this.snackBar.open('Usuario creado y sesión iniciada con éxito', 'Cerrar', {
                duration: 5000,
                panelClass: ['success-snackbar'],
                verticalPosition: 'top',
                horizontalPosition: 'center',
              });
              this.dialogRef.close(true);
              this.router.navigate(['/dashboard']);
            },
            error: () => {
              this.isLoading = false;
              this.snackBar.open(
                'Usuario creado pero hubo un error al iniciar sesión. Por favor, inténtalo manualmente.',
                'Cerrar',
                { duration: 5000 },
              );
              this.dialogRef.close(true);
            },
          });
        },
        error: (error: any) => {
          this.isLoading = false;
          this.snackBar.open(error.error?.message || 'Error al crear usuario', 'Cerrar', {
            duration: 5000,
          });
        },
      });
    } else {
      this.userService.updateUser(this.data.user!.id, userData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Usuario actualizado con éxito', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.snackBar.open(error.error?.message || 'Error al actualizar el usuario', 'Cerrar', {
            duration: 3000,
          });
        },
      });
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
