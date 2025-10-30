import { Component, Inject, ViewEncapsulation, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { CreateTaskDto, Task, TaskStatus, TaskRecurrence } from '../../../core/models';
import { TaskType } from '../../../core/models/task-type.enum';
import { TaskRecurrenceSelectorComponent } from '../task-recurrence-selector/task-recurrence-selector';
import { TaskTagsInputComponent } from '../task-tags-input/task-tags-input';
import { TaskService } from '../../../core/services';

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
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    MatDividerModule,
    TaskRecurrenceSelectorComponent,
    TaskTagsInputComponent
  ],
  templateUrl: './create-task-dialog.html',
  styleUrl: './create-task-dialog.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTaskDialogComponent implements OnInit {
  TaskStatus = TaskStatus;
  TaskRecurrence = TaskRecurrence;
  TaskType = TaskType;

  // Available parent tasks for hierarchy
  availableParents = signal<Task[]>([]);
  loadingParents = signal(false);

  taskData: TaskFormData = {
    title: '',
    priority: 'medium',
    status: TaskStatus.DRAFT,
    type: TaskType.TASK,
    progress: 0,
    recurrence: TaskRecurrence.NONE,
    tags: []
  };

  constructor(
    public dialogRef: MatDialogRef<CreateTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: Task,
    private taskService: TaskService
  ) {
    if (data) {
      this.taskData = {
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        type: data.type,
        progress: data.progress,
        priority: data.priority,
        parentId: data.parentId || undefined,
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

  ngOnInit() {
    // Load available parent tasks
    this.loadAvailableParents();
  }

  loadAvailableParents() {
    this.loadingParents.set(true);
    this.taskService.findAll({
      limit: 100,
      types: [TaskType.PROJECT, TaskType.EPIC]
    }).subscribe({
      next: (response) => {
        const tasks = response.data || [];
        // If editing, exclude current task and its descendants
        const filtered = this.data
          ? tasks.filter(t => t.id !== this.data!.id)
          : tasks;
        this.availableParents.set(filtered);
        this.loadingParents.set(false);
      },
      error: (err) => {
        console.error('Error loading parent tasks:', err);
        this.loadingParents.set(false);
      }
    });
  }

  formatLabel(value: number): string {
    return `${value}%`;
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case TaskType.TASK: return 'check_circle';
      case TaskType.PROJECT: return 'folder';
      case TaskType.EPIC: return 'workspaces';
      case TaskType.MILESTONE: return 'flag';
      default: return 'help';
    }
  }

  isFormValid(): boolean {
    if (!this.taskData.title?.trim()) return false;

    // Check date consistency
    if (this.taskData.startDate && this.taskData.dueDate) {
      const start = this.taskData.startDate instanceof Date
        ? this.taskData.startDate
        : new Date(this.taskData.startDate);
      const due = this.taskData.dueDate instanceof Date
        ? this.taskData.dueDate
        : new Date(this.taskData.dueDate);
      if (start > due) return false;
    }

    return true;
  }

  onSubmit() {
    if (!this.isFormValid()) {
      return;
    }

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
