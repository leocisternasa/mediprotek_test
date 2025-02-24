import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User, Role } from '@mediprotek/shared-interfaces';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class ProfileComponent implements OnInit {
  roles = Object.values(Role);
  Role = Role; // Para usar en el template
  currentUser: User | null = null; // Para usar en el template
  user: User | null = null;
  isEditing = false;
  tempValues: { [key: string]: string } = {};
  isCurrentUser = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = currentUser;

    if (userId) {
      // Si hay un ID en la URL, estamos viendo el perfil de otro usuario
      this.isCurrentUser = userId === currentUser.id;

      // Si no es admin y está intentando ver el perfil de otro usuario
      if (!this.isCurrentUser && currentUser.role !== Role.ADMIN) {
        this.router.navigate(['/dashboard']);
        return;
      }

      // Cargar el usuario específico
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          this.user = user;
        },
        error: (error) => {
          console.error('Error loading user:', error);
          this.snackBar.open('Error al cargar el usuario', 'Cerrar', {
            duration: 3000,
          });
          this.router.navigate(['/dashboard']);
        },
      });
    } else {
      // Si no hay ID, estamos en /profile, mostrar el usuario actual
      this.isCurrentUser = true;
      this.user = currentUser;
    }
  }

  startEditing() {
    if (this.user) {
      this.isEditing = true;
      this.tempValues = {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        role: this.user.role
      };
    }
  }

  cancelEditing() {
    this.isEditing = false;
    this.tempValues = {};
  }

  saveChanges() {
    if (!this.user || !Object.keys(this.tempValues).length) return;

    // Solo incluir los campos que han cambiado
    const updateData = Object.entries(this.tempValues).reduce((acc, [key, value]) => {
      if (this.user && value !== this.user[key as keyof User]) {
        acc[key] = value;
      }
      return acc;
    }, {} as { [key: string]: string });

    // Si no hay cambios, solo cancelar la edición
    if (!Object.keys(updateData).length) {
      this.cancelEditing();
      return;
    }

    this.userService.updateUser(this.user.id, updateData).subscribe({
      next: (updatedUser) => {
        console.log('✅ User updated successfully:', updatedUser);
        this.user = { ...this.user, ...updateData } as User;
        // Si es el usuario actual, actualizar el currentUser
        if (this.isCurrentUser) {
          this.authService.updateCurrentUser(this.user);
        }

        this.isEditing = false;
        this.tempValues = {};
        this.snackBar.open('Usuario actualizado con éxito', 'Cerrar', {
          duration: 3000,
        });
      },
      error: (error) => {
        console.error('❌ Error updating user:', error);
      }
    });
  }
}
