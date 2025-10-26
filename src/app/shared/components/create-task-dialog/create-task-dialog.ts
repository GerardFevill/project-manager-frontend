import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CreateTaskDto, Task, TaskStatus, TaskRecurrence } from '../../../core/models';
import { TaskRecurrenceSelectorComponent } from '../task-recurrence-selector/task-recurrence-selector';
import { TaskTagsInputComponent } from '../task-tags-input/task-tags-input';

// Internal type for form data that accepts Date objects
type TaskFormData = Omit<CreateTaskDto, 'dueDate' | 'startDate'> & {
  dueDate?: Date | string;
  startDate?: Date | string;
  actualHours?: number;
};

@Component({
  selector: 'app-create-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TaskRecurrenceSelectorComponent,
    TaskTagsInputComponent
  ],
  templateUrl: './create-task-dialog.html',
  styleUrl: './create-task-dialog.scss',
  encapsulation: ViewEncapsulation.None
})
export class CreateTaskDialogComponent {
  TaskStatus = TaskStatus;
  TaskRecurrence = TaskRecurrence;

  taskData: TaskFormData = {
    title: '',
    priority: 'medium',
    status: TaskStatus.DRAFT,
    progress: 0,
    recurrence: TaskRecurrence.NONE,
    tags: []
  };

  constructor(
    public dialogRef: MatDialogRef<CreateTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: Task
  ) {
    if (data) {
      this.taskData = {
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        progress: data.progress,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        recurrence: data.recurrence,
        nextOccurrence: data.nextOccurrence ? new Date(data.nextOccurrence).toISOString().slice(0, 16) : undefined,
        tags: data.tags || [],
        estimatedHours: data.estimatedHours || undefined,
        actualHours: data.actualHours || undefined,
      };
    }
  }

  formatLabel(value: number): string {
    return `${value}%`;
  }

  onSubmit() {
    if (this.taskData.title.trim()) {
      // Convert Date objects to ISO strings for API
      const dataToSubmit: CreateTaskDto & { actualHours?: number } = {
        ...this.taskData,
        dueDate: this.taskData.dueDate instanceof Date
          ? this.taskData.dueDate.toISOString().split('T')[0]
          : this.taskData.dueDate,
        startDate: this.taskData.startDate instanceof Date
          ? this.taskData.startDate.toISOString().split('T')[0]
          : this.taskData.startDate,
      };

      // If creating (no data), remove actualHours as it's only for updates
      if (!this.data && dataToSubmit.actualHours !== undefined) {
        const { actualHours, ...createData } = dataToSubmit;
        this.dialogRef.close(createData);
      } else {
        this.dialogRef.close(dataToSubmit);
      }
    }
  }
}
