import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Sprint, CreateSprintDto } from '../../../core/models';

@Component({
  selector: 'app-sprint-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './sprint-dialog.html',
  styleUrl: './sprint-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SprintDialogComponent {
  sprintData: CreateSprintDto = {
    name: '',
    goal: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +2 weeks
  };

  constructor(
    public dialogRef: MatDialogRef<SprintDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: Sprint
  ) {
    if (data) {
      this.sprintData = {
        name: data.name,
        goal: data.goal || '',
        startDate: data.startDate,
        endDate: data.endDate
      };
    }
  }

  isFormValid(): boolean {
    if (!this.sprintData.name?.trim()) return false;
    if (!this.sprintData.startDate || !this.sprintData.endDate) return false;

    const start = new Date(this.sprintData.startDate);
    const end = new Date(this.sprintData.endDate);

    return start < end;
  }

  onSubmit() {
    if (!this.isFormValid()) return;
    this.dialogRef.close(this.sprintData);
  }
}
