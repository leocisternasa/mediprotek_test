import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';

// Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
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

// Services and Components
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User, Role, UserFilters } from '@mediprotek/shared-interfaces';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

// RxJS
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'mediprotek-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
  ]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // Exponer Role al template
  protected Role = Role;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['select', 'name', 'email', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  selection = new SelectionModel<User>(true, []);
  searchControl = new FormControl('');
  currentUser: User | null = null;
  isAdmin = false;
  pageSize = 10;
  totalUsers = 0;
  currentSort: Sort = { active: 'firstName', direction: 'asc' };

  // Mapeo de nombres de columnas a campos del backend
  sortFieldMap: { [key: string]: string } = {
    firstName: 'firstName',
    email: 'email',
    role: 'role'
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    console.log('🟡 Dashboard Component initializing...');
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role === Role.ADMIN;

    if (!this.isAdmin) {
      this.displayedColumns = this.displayedColumns.filter(col => col !== 'select');
    }

    this.loadUsers();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.loadUsers();
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSort(sort: Sort) {
    this.currentSort = sort;
    this.loadUsers();
  }

  loadUsers() {
    const filters: UserFilters = {
      search: this.searchControl.value || '',
      page: this.paginator ? Math.max(1, this.paginator.pageIndex + 1) : 1,
      limit: this.pageSize,
      sortBy: this.sortFieldMap[this.currentSort.active] || 'firstName',
      sortDirection: this.currentSort.direction || 'asc'
    };

    console.log('🔄 Loading users with filters:', filters);

    this.userService
      .getUsers(filters)
      .subscribe({
        next: response => {
          console.log('✅ Users loaded:', response);
          this.dataSource.data = response.users;
          this.totalUsers = response.total;
        },
        error: error => {
          console.error('Error loading users:', error);
          this.dataSource.data = [];
          this.totalUsers = 0;
        }
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  createUser() {
    const dialogRef = this.dialog.open(EditUserComponent, {
      data: { isNew: true },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }

  editUser(user: User) {
    const dialogRef = this.dialog.open(EditUserComponent, {
      data: { user, isNew: false },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadUsers();
    });
  }

  deleteUser(user: User) {
    const isCurrentUser = user.id === this.currentUser?.id;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar eliminación',
        message: isCurrentUser
          ? '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer y serás desconectado del sistema.'
          : `¿Estás seguro de que deseas eliminar al usuario ${user.firstName} ${user.lastName}?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('🗑 Attempting to delete user:', user.id);
        this.userService.deleteUser(user.id).subscribe({
          next: response => {
            console.log('✅ Delete response:', response);

            // Emitir el evento de usuario eliminado
            this.authService.emitUserEvent({
              type: 'user.deleted',
              id: user.id,
              deletedAt: new Date().toISOString()
            });

            if (isCurrentUser) {
              // Si el usuario eliminó su propia cuenta, cerrar sesión
              this.authService.clearStorage();
              this.router.navigate(['/login']);
            } else {
              this.snackBar.open('Usuario eliminado con éxito', 'Cerrar', {
                duration: 3000
              });
              this.loadUsers();
            }
          },
          error: error => {
            console.error('❌ Delete error:', error);
            this.snackBar.open('Error al eliminar usuario', 'Cerrar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  deleteBulkUsers() {
    const selectedUsers = this.selection.selected;
    const selectedIds = selectedUsers.map(user => user.id);

    const bulkDeleteDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar eliminación masiva',
        message: `¿Estás seguro de que deseas eliminar ${selectedUsers.length} ${
          selectedUsers.length === 1 ? 'usuario' : 'usuarios'
        }?`,
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
        this.userService.deleteUsers(selectedIds).subscribe({
          next: () => {
            this.snackBar.open(
              `${selectedUsers.length} ${
                selectedUsers.length === 1 ? 'usuario eliminado' : 'usuarios eliminados'
              } con éxito`,
              'Cerrar',
              { duration: 3000 }
            );
            this.loadUsers();
            this.selection.clear();
          },
          error: error => {
            console.error('❌ Delete error:', error);
            this.snackBar.open('Error al eliminar usuarios', 'Cerrar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // El AuthService ya maneja la limpieza del storage y la redirección
        this.snackBar.open('Sesión cerrada correctamente', 'Cerrar', {
          duration: 3000
        });
      },
      error: error => {
        console.error('🔴 Logout error:', error);
        // Incluso si hay error, forzamos el logout
        this.authService.clearStorage();
        this.router.navigate(['/login']);
        this.snackBar.open('Error al cerrar sesión', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }
}
