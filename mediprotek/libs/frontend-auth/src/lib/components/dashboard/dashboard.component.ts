import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User, Role } from '@mediprotek/shared-interfaces';
import { EditUserComponent } from '../edit-user/edit-user.component';

@Component({
  selector: 'mediprotek-dashboard',
  template: `
    <!-- Header fijo -->
    <div class="fixed-header">
      <mat-toolbar color="primary">
        <span>Dashboard</span>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="createUser()" *ngIf="isAdmin">
          <mat-icon>add</mat-icon>
          Nuevo Usuario
        </button>
        <button mat-icon-button [matMenuTriggerFor]="menu" class="profile-button">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item routerLink="/profile" *ngIf="currentUser">
            <mat-icon>person</mat-icon>
            <span>Mi Perfil</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Cerrar Sesión</span>
          </button>
        </mat-menu>
      </mat-toolbar>
    </div>

    <!-- Contenido scrolleable -->
    <div class="scrollable-content">
      <!-- Search -->
      <div class="search-container">
        <mat-form-field appearance="outline">
          <mat-label>Buscar usuarios</mat-label>
          <input matInput [formControl]="searchControl" placeholder="Buscar por nombre o email" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <!-- Users Table -->
      <div class="table-wrapper mat-elevation-z8">
        <div class="table-container">
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
            <td mat-cell *matCellDef="let user">
              <mat-chip-set>
                <mat-chip [color]="user.role === Role.ADMIN ? 'accent' : 'primary'" selected>
                  {{ user.role === Role.ADMIN ? 'Administrador' : 'Usuario' }}
                </mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let user">
              <button
                mat-icon-button
                [matMenuTriggerFor]="actionMenu"
                *ngIf="isAdmin || currentUser?.id === user.id"
              >
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #actionMenu="matMenu">
                <button mat-menu-item (click)="editUser(user)">
                  <mat-icon>edit</mat-icon>
                  <span>Edición Rápida</span>
                </button>
                <button mat-menu-item [routerLink]="currentUser?.id === user.id ? '/profile' : ['/users', user.id]">
                  <mat-icon>person</mat-icon>
                  <span>Ver Detalle</span>
                </button>
                <button mat-menu-item (click)="deleteUser(user)" color="warn">
                  <mat-icon>delete</mat-icon>
                  <span>Eliminar</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>

        <mat-paginator
          [length]="totalUsers"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 100]"
          (page)="onPageChange($event)"
          class="sticky-paginator"
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
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
      }
      .fixed-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
      }
      .profile-button {
        margin-left: 16px;
      }
      .spacer {
        flex: 1 1 auto;
      }
      .scrollable-content {
        margin-top: 64px; /* Altura del header */
        padding: 20px;
        height: calc(100vh - 64px);
        overflow-y: auto;
      }
      .search-container {
        margin-bottom: 20px;
      }
      mat-form-field {
        width: 100%;
        max-width: 500px;
      }
      .table-wrapper {
        display: flex;
        flex-direction: column;
        height: 500px; /* Altura fija para la tabla */
        margin-bottom: 20px;
      }
      .table-container {
        flex: 1;
        overflow: auto;
        min-height: 0;
      }
      table {
        width: 100%;
      }
      /* Hacer el header sticky */
      .mat-mdc-header-row {
        position: sticky;
        top: 0;
        z-index: 100;
        background: white;
      }
      /* Asegurar que las filas de datos tengan altura suficiente */
      .mat-mdc-row {
        height: 48px; /* Altura estándar de Material */
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
      /* Hacer el paginador sticky */
      .sticky-paginator {
        position: sticky;
        bottom: 0;
        z-index: 100;
        background: white;
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
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
    RouterModule,
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
  Role = Role; // Para usar en el template

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
    private dialog: MatDialog,
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

    this.userService.getUsers(filters).subscribe(
      response => {
        console.log('✅ Users loaded successfully:', response);
        this.users = response.users;
        this.totalUsers = response.total;
        this.selection.clear();
        console.log('📊 Current users:', this.users);
      },
      error => {
        console.error('Error loading users:', error);
        this.users = [];
        this.totalUsers = 0;
      }
    );
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
    const dialogRef = this.dialog.open(EditUserComponent, {
      data: { isNew: true },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  editUser(user: User) {
    const dialogRef = this.dialog.open(EditUserComponent, {
      data: { user, isNew: false },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar al usuario ${user.firstName} ${user.lastName}?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('🗑 Attempting to delete user:', user.id);
        this.userService.deleteUser(user.id).subscribe({
          next: (response) => {
            console.log('✅ Delete response:', response);
            this.snackBar.open('Usuario eliminado con éxito', 'Cerrar', {
              duration: 3000,
            });
            if (user.id === this.currentUser?.id) {
              this.authService.logout();
            } else {
              this.loadUsers();
            }
          },
          error: (error) => {
            console.error('❌ Delete error:', error);
            this.snackBar.open('Error al eliminar usuario', 'Cerrar', {
              duration: 3000,
            });
          }
        });
      }
    });
  }

  deleteBulkUsers(): void {
    const selectedUsers = this.selection.selected;
    if (selectedUsers.length === 0) return;

    const bulkDeleteDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar eliminación masiva',
        message: `¿Estás seguro de que deseas eliminar ${selectedUsers.length} ${selectedUsers.length === 1 ? 'usuario' : 'usuarios'}?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        users: selectedUsers.map(user => ({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }))
      }
    });

    bulkDeleteDialogRef.afterClosed().subscribe(result => {
      if (result) {
        const selectedIds = selectedUsers.map(user => user.id);
        this.userService.deleteUsers(selectedIds).subscribe({
          next: () => {
            this.snackBar.open(
              `${selectedUsers.length} ${selectedUsers.length === 1 ? 'usuario eliminado' : 'usuarios eliminados'} con éxito`,
              'Cerrar',
              { duration: 3000 }
            );
            this.loadUsers();
            this.selection.clear();
          },
          error: (error) => {
            console.error('❌ Delete error:', error);
            this.snackBar.open('Error al eliminar usuarios', 'Cerrar', {
              duration: 3000,
            });
          }
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
