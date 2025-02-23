import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
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
            <input matInput formControlName="firstName" placeholder="Ingrese nombre">
            <mat-error *ngIf="userForm.get('firstName')?.errors?.['required']">
              El nombre es requerido
            </mat-error>
            <mat-error *ngIf="userForm.get('firstName')?.errors?.['minlength']">
              El nombre debe tener al menos 2 caracteres
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Apellido</mat-label>
            <input matInput formControlName="lastName" placeholder="Ingrese apellido">
            <mat-error *ngIf="userForm.get('lastName')?.errors?.['required']">
              El apellido es requerido
            </mat-error>
            <mat-error *ngIf="userForm.get('lastName')?.errors?.['minlength']">
              El apellido debe tener al menos 2 caracteres
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" placeholder="Ingrese email" type="email">
            <mat-error *ngIf="userForm.get('email')?.errors?.['required']">
              El email es requerido
            </mat-error>
            <mat-error *ngIf="userForm.get('email')?.errors?.['email']">
              Ingrese un email válido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="isAdmin && !isSelfEdit">
            <mat-label>Rol</mat-label>
            <mat-select formControlName="role">
              <mat-option [value]="Role.USER">Usuario</mat-option>
              <mat-option [value]="Role.ADMIN">Administrador</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Contraseña {{ !isNewUser ? '(opcional)' : '' }}</mat-label>
            <input matInput formControlName="password" type="password" 
                   placeholder="{{ !isNewUser ? 'Dejar en blanco para mantener la actual' : 'Ingrese contraseña' }}">
            <mat-error *ngIf="userForm.get('password')?.errors?.['required']">
              La contraseña es requerida
            </mat-error>
            <mat-error *ngIf="userForm.get('password')?.errors?.['minlength']">
              La contraseña debe tener al menos 6 caracteres
            </mat-error>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" 
                [disabled]="userForm.invalid || isLoading">
          <span *ngIf="!isLoading">{{ isNewUser ? 'Crear' : 'Guardar' }}</span>
          <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 400px;
        padding: 16px 0;
      }

      mat-form-field {
        width: 100%;
      }

      mat-dialog-actions {
        padding: 16px 0;
      }

      button[type="submit"] {
        min-width: 100px;
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
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
})
export class EditUserComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  isAdmin = false;
  isSelfEdit = false;
  isNewUser: boolean;
  Role = Role; // Para usar en el template

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditUserComponent>,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User; isNew?: boolean }
  ) {
    this.isNewUser = data.isNew || false;
    this.initForm();
  }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === Role.ADMIN;
    this.isSelfEdit = currentUser?.id === this.data.user?.id;

    if (!this.isNewUser && this.data.user) {
      this.userForm.patchValue({
        firstName: this.data.user.firstName,
        lastName: this.data.user.lastName,
        email: this.data.user.email,
        role: this.data.user.role,
      });
    }

    // La contraseña es requerida solo para nuevos usuarios
    if (!this.isNewUser) {
      this.userForm.get('password')?.setValidators(null);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  private initForm() {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [Role.USER],
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.isLoading = true;
    const userData = this.userForm.value;

    // Si la contraseña está vacía en modo edición, la eliminamos
    if (!this.isNewUser && !userData.password) {
      delete userData.password;
    }

    // Si no es admin o está editando su propio perfil, no puede cambiar el rol
    if (!this.isAdmin || this.isSelfEdit) {
      delete userData.role;
    }

    const operation = this.isNewUser
      ? this.userService.createUser(userData)
      : this.userService.updateUser(this.data.user!.id, userData);

    operation.subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open(
          `Usuario ${this.isNewUser ? 'creado' : 'actualizado'} con éxito`,
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(response);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.error?.message || 'Error al procesar la solicitud',
          'Cerrar',
          { duration: 5000 }
        );
      },
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
