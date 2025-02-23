import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'mediprotek-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
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
      min-width: 300px;
    }
    mat-dialog-content {
      margin: 20px 0;
    }
    mat-dialog-actions {
      padding: 16px 0;
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
