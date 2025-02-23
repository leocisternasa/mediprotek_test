import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User, Role } from '@mediprotek/shared-interfaces';

@Component({
  selector: 'mediprotek-dashboard',
  template: `
    <mat-toolbar color="primary">
      <span>Dashboard</span>
      <span class="spacer"></span>
      <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item>
          <mat-icon>person</mat-icon>
          <span>Perfil</span>
        </button>
        <button mat-menu-item (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
          <span>Cerrar Sesión</span>
        </button>
      </mat-menu>
    </mat-toolbar>

    <div class="content">
      <!-- Search and Actions -->
      <div class="actions-row">
        <mat-form-field appearance="outline">
          <mat-label>Buscar usuarios</mat-label>
          <input matInput [formControl]="searchControl" placeholder="Buscar por nombre o email" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <button mat-raised-button color="primary" (click)="createUser()" *ngIf="isAdmin">
          <mat-icon>add</mat-icon>
          Nuevo Usuario
        </button>
      </div>

      <!-- Users Table -->
      <div class="table-container mat-elevation-z8">
        <table mat-table [dataSource]="users" matSort (matSortChange)="onSort($event)">
          <!-- Checkbox Column -->
          <ng-container matColumnDef="select" *ngIf="isAdmin">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox
                (change)="$event ? masterToggle() : null"
                [checked]="selection.hasValue() && isAllSelected()"
                [indeterminate]="selection.hasValue() && !isAllSelected()"
              >
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox
                (click)="$event.stopPropagation()"
                (change)="$event ? selection.toggle(row) : null"
                [checked]="selection.isSelected(row)"
              >
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
            <td mat-cell *matCellDef="let user">{{ user.firstName }} {{ user.lastName }}</td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <!-- Role Column -->
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Rol</th>
            <td mat-cell *matCellDef="let user">{{ user.role }}</td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let user">
              <button
                mat-icon-button
                color="primary"
                (click)="editUser(user)"
                *ngIf="isAdmin || currentUser?.id === user.id"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                (click)="deleteUser(user)"
                *ngIf="isAdmin || currentUser?.id === user.id"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <mat-paginator
          [length]="totalUsers"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="onPageChange($event)"
        >
        </mat-paginator>
      </div>

      <!-- Bulk Delete Button -->
      <div class="bulk-actions" *ngIf="isAdmin && selection.hasValue()">
        <button mat-raised-button color="warn" (click)="deleteBulkUsers()">
          Eliminar {{ selection.selected.length }} usuarios seleccionados
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }
      .spacer {
        flex: 1 1 auto;
      }
      .content {
        padding: 20px;
      }
      .actions-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .table-container {
        position: relative;
        min-height: 200px;
        max-height: 600px;
        overflow: auto;
      }
      table {
        width: 100%;
      }
      .mat-column-select {
        width: 48px;
        padding-left: 8px;
      }
      .mat-column-actions {
        width: 100px;
        text-align: center;
      }
      .bulk-actions {
        margin-top: 16px;
        text-align: right;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule,
  ],
})
export class DashboardComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<User>;

  users: User[] = [];
  displayedColumns: string[] = ['name', 'email', 'role', 'actions'];
  searchControl = new FormControl('');
  selection = new SelectionModel<User>(true, []);
  currentUser: User | null = null;
  isAdmin = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalUsers = 0;

  // Sorting
  currentSort: Sort = { active: 'name', direction: 'asc' };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    console.log('🟡 Dashboard Component initializing...');
    this.currentUser = this.authService.getCurrentUser();
    console.log('🔵 Current user:', this.currentUser);
    this.isAdmin = this.currentUser?.role === Role.ADMIN;
    console.log('🔵 Is admin:', this.isAdmin);

    if (this.isAdmin) {
      this.displayedColumns = ['select', ...this.displayedColumns];
    }
    console.log('🔵 Display columns:', this.displayedColumns);

    this.loadUsers();

    // Setup search with debounce
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        console.log('🔍 Search value changed, reloading users...');
        this.currentPage = 0;
        this.loadUsers();
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.users.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.users.forEach(row => this.selection.select(row));
  }

  loadUsers() {
    console.log('📥 Loading users...');
    const filters = {
      search: this.searchControl.value || '',
      page: this.currentPage + 1, // El backend espera que la página empiece en 1
      limit: this.pageSize,
      sortBy: this.currentSort.active,
      sortDirection: this.currentSort.direction as 'asc' | 'desc',
    };
    console.log('🔍 Filters:', filters);

    this.userService.getUsers(filters).subscribe({
      next: response => {
        console.log('✅ Users loaded successfully:', response);
        if (response.data && response.data.users) {
          this.users = response.data.users;
          this.totalUsers = response.data.total;
          this.selection.clear();
          console.log('📊 Current users:', this.users);
        } else {
          console.error('❌ No users data in response:', response);
          this.users = [];
          this.totalUsers = 0;
        }
      },
      error: error => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSort(sort: Sort) {
    this.currentSort = sort;
    this.loadUsers();
  }

  createUser() {
    // Implementar navegación a la página de creación
    console.log('Create user clicked');
  }

  editUser(user: User) {
    // Implementar navegación a la página de edición
    console.log('Edit user clicked:', user);
  }

  deleteUser(user: User) {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.firstName}?`)) {
      console.log('🗑 Attempting to delete user:', user.id);
      this.userService.deleteUser(user.id).subscribe({
        next: (response) => {
          console.log('✅ Delete response:', response);
          this.snackBar.open('Usuario eliminado con éxito', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.loadUsers();

          // Si el usuario eliminó su propia cuenta
          if (this.currentUser?.id === user.id) {
            this.authService.logout();
            this.router.navigate(['/register']);
          }
        },
        error: (error) => {
          console.error('❌ Error deleting user:', error);
          const errorMessage = error.error?.message || 'Error al eliminar usuario';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }

  deleteBulkUsers() {
    const selectedIds = this.selection.selected.map(user => user.id);
    if (selectedIds.length === 0) return;

    if (confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} usuarios?`)) {
      this.userService.deleteUsers(selectedIds).subscribe({
        next: () => {
          this.snackBar.open('Usuarios eliminados con éxito', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.selection.clear();
          this.loadUsers();
        },
        error: error => {
          console.error('Error deleting users:', error);
          this.snackBar.open('Error al eliminar usuarios', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
