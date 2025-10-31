import { Component, Inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { WorkLog, parseTimeString, formatHours } from '../../../core/models';

export interface LogWorkDialogData {
  taskId: string;
  workLog?: WorkLog; // For editing
}

export interface LogWorkDialogResult {
  timeSpent: number;
  description: string;
  workDate: string;
}

/**
 * Log Work Dialog - Jira-style time tracking
 */
@Component({
  selector: 'app-log-work-dialog',
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
  template: `
    <h2 mat-dialog-title>
      <mat-icon>schedule</mat-icon>
      {{ data.workLog ? 'Edit Work Log' : 'Log Work' }}
    </h2>

    <mat-dialog-content>
      <div class="log-work-form">
        <!-- Time Spent -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Time Spent</mat-label>
          <input
            matInput
            [(ngModel)]="timeInput"
            placeholder="e.g., 2h 30m, 1h, 45m"
            (blur)="validateTimeInput()"
            required>
          <mat-icon matSuffix>schedule</mat-icon>
          <mat-hint>Examples: 2h, 1h 30m, 45m</mat-hint>
          @if (timeError()) {
            <mat-error>{{ timeError() }}</mat-error>
          }
        </mat-form-field>

        <!-- Work Date -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            [(ngModel)]="workDate"
            [max]="maxDate"
            required>
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <!-- Description -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Work Description (optional)</mat-label>
          <textarea
            matInput
            [(ngModel)]="description"
            rows="4"
            placeholder="What did you work on?"
            maxlength="500"></textarea>
          <mat-hint align="end">{{ description.length }} / 500</mat-hint>
        </mat-form-field>

        <!-- Time Preview -->
        @if (timeSpentHours() > 0) {
          <div class="time-preview">
            <mat-icon>info</mat-icon>
            <span>Logging <strong>{{ formatHours(timeSpentHours()) }}</strong></span>
          </div>
        }
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="!isValid()">
        {{ data.workLog ? 'Update' : 'Log Work' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #172b4d;
      font-size: 20px;
      font-weight: 500;
      margin: 0 0 20px 0;

      mat-icon {
        color: #0052cc;
      }
    }

    mat-dialog-content {
      min-width: 500px;
      max-width: 600px;
      padding: 0 24px;
    }

    .log-work-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 0;
    }

    .full-width {
      width: 100%;
    }

    .time-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #deebff;
      border-left: 3px solid #0052cc;
      border-radius: 3px;
      font-size: 14px;
      color: #172b4d;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #0052cc;
      }

      strong {
        color: #0052cc;
        font-weight: 600;
      }
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;

      button {
        text-transform: none;
        font-weight: 500;
      }
    }

    html.dark-mode {
      h2[mat-dialog-title] {
        color: #b6c2cf;
      }

      .time-preview {
        background: #1d3660;
        color: #b6c2cf;

        strong {
          color: #4c9aff;
        }

        mat-icon {
          color: #4c9aff;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogWorkDialogComponent {
  timeInput = '';
  description = '';
  workDate = new Date();
  maxDate = new Date();

  timeSpentHours = signal(0);
  timeError = signal('');

  constructor(
    public dialogRef: MatDialogRef<LogWorkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LogWorkDialogData
  ) {
    // If editing, populate fields
    if (data.workLog) {
      this.timeInput = formatHours(data.workLog.timeSpent);
      this.description = data.workLog.description || '';
      this.workDate = new Date(data.workLog.workDate);
      this.timeSpentHours.set(data.workLog.timeSpent);
    }
  }

  validateTimeInput() {
    this.timeError.set('');

    if (!this.timeInput.trim()) {
      this.timeError.set('Time spent is required');
      this.timeSpentHours.set(0);
      return;
    }

    try {
      const hours = parseTimeString(this.timeInput);

      if (isNaN(hours) || hours <= 0) {
        this.timeError.set('Invalid time format. Use: 2h, 1h 30m, 45m, etc.');
        this.timeSpentHours.set(0);
        return;
      }

      if (hours > 24) {
        this.timeError.set('Cannot log more than 24 hours per entry');
        this.timeSpentHours.set(0);
        return;
      }

      this.timeSpentHours.set(hours);
    } catch (e) {
      this.timeError.set('Invalid time format. Use: 2h, 1h 30m, 45m, etc.');
      this.timeSpentHours.set(0);
    }
  }

  isValid(): boolean {
    this.validateTimeInput();
    return this.timeSpentHours() > 0 && this.timeSpentHours() <= 24 && !this.timeError();
  }

  formatHours(hours: number): string {
    return formatHours(hours);
  }

  onSubmit() {
    if (!this.isValid()) return;

    const result: LogWorkDialogResult = {
      timeSpent: this.timeSpentHours(),
      description: this.description.trim(),
      workDate: this.workDate.toISOString().split('T')[0]
    };

    this.dialogRef.close(result);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
