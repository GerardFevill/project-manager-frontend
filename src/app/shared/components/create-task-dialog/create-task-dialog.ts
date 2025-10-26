import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CreateTaskDto, Task, TaskStatus, TaskRecurrence } from '../../../core/models';
import { TaskRecurrenceSelectorComponent } from '../task-recurrence-selector/task-recurrence-selector';
import { TaskTagsInputComponent } from '../task-tags-input/task-tags-input';

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

  taskData: CreateTaskDto & { actualHours?: number } = {
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
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : undefined,
        startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : undefined,
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
      // If creating (no data), remove actualHours as it's only for updates
      if (!this.data && this.taskData.actualHours !== undefined) {
        const { actualHours, ...createData } = this.taskData;
        this.dialogRef.close(createData);
      } else {
        this.dialogRef.close(this.taskData);
      }
    }
  }
}
