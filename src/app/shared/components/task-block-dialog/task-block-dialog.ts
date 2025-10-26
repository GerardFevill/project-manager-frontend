import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Task } from '../../../core/models';

export interface BlockDialogData {
  task: Task;
}

export interface BlockDialogResult {
  reason?: string;
}

@Component({
  selector: 'app-task-block-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './task-block-dialog.html',
  styleUrl: './task-block-dialog.scss'
})
export class TaskBlockDialogComponent {
  reason = '';

  constructor(
    public dialogRef: MatDialogRef<TaskBlockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BlockDialogData
  ) {}

  onBlock(): void {
    const result: BlockDialogResult = {
      reason: this.reason.trim() || undefined
    };
    this.dialogRef.close(result);
  }
}
