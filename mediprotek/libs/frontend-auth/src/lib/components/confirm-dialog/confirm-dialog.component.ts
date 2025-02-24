import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  users?: Array<{ firstName: string; lastName: string; email: string; }>;
}

@Component({
  selector: 'mediprotek-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      <div class="users-list" *ngIf="data.users && data.users.length > 0">
        <p class="users-list-title">Usuarios a eliminar:</p>
        <div class="user-item" *ngFor="let user of data.users">
          <span>{{ user.firstName }} {{ user.lastName }}</span>
          <small class="user-email">({{ user.email }})</small>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">
        {{ data.cancelText || 'Cancelar' }}
      </button>
      <button mat-raised-button color="warn" (click)="onYesClick()">
        {{ data.confirmText || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 400px;
    }
    mat-dialog-content {
      margin: 20px 0;
    }
    mat-dialog-actions {
      padding: 16px 0;
    }
    .users-list {
      margin-top: 16px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .users-list-title {
      font-weight: 500;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.87);
    }
    .user-item {
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .user-item:last-child {
      border-bottom: none;
    }
    .user-email {
      margin-left: 8px;
      color: rgba(0, 0, 0, 0.54);
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
