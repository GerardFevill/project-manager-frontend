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
import { CreateTaskDto, Task, TaskStatus, TaskRecurrence, IssueType, User } from '../../../core/models';
import { TaskType } from '../../../core/models/task-type.enum';
import { TaskRecurrenceSelectorComponent } from '../task-recurrence-selector/task-recurrence-selector';
import { TaskTagsInputComponent } from '../task-tags-input/task-tags-input';
import { TaskService, UserService } from '../../../core/services';
import { UserAvatarComponent } from '../user-avatar/user-avatar';

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
    TaskTagsInputComponent,
    UserAvatarComponent
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
  IssueType = IssueType;

  // Available parent tasks for hierarchy
  availableParents = signal<Task[]>([]);
  loadingParents = signal(false);

  // Available users for assignment
  availableUsers = signal<User[]>([]);
  loadingUsers = signal(false);

  taskData: TaskFormData = {
    title: '',
    priority: 'medium',
    status: TaskStatus.DRAFT,
    type: TaskType.TASK,
    issueType: IssueType.TASK,
    progress: 0,
    recurrence: TaskRecurrence.NONE,
    tags: []
  };

  constructor(
    public dialogRef: MatDialogRef<CreateTaskDialogComponent>,
    private taskService: TaskService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data?: Task
  ) {
    if (data) {
      this.taskData = {
        title: data.title,
        description: data.description || undefined,
        status: data.status,
        type: data.type,
        issueType: data.issueType,
        progress: data.progress,
        priority: data.priority,
        parentId: data.parentId || undefined,
        assigneeId: data.assigneeId || undefined,
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
    // Load available parent tasks and users
    this.loadAvailableParents();
    this.loadAvailableUsers();
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

  loadAvailableUsers() {
    this.loadingUsers.set(true);
    this.userService.findAll().subscribe({
      next: (users: User[]) => {
        // Only active users
        const activeUsers = users.filter((u: User) => u.isActive);
        this.availableUsers.set(activeUsers);
        this.loadingUsers.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loadingUsers.set(false);
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

  getIssueTypeIcon(issueType: IssueType): string {
    switch (issueType) {
      case IssueType.EPIC: return 'bolt';
      case IssueType.STORY: return 'bookmark';
      case IssueType.TASK: return 'check_box';
      case IssueType.BUG: return 'bug_report';
      case IssueType.SUBTASK: return 'subdirectory_arrow_right';
      default: return 'check_box';
    }
  }

  getIssueTypeColor(issueType: IssueType): string {
    switch (issueType) {
      case IssueType.EPIC: return '#6554C0';
      case IssueType.STORY: return '#00875A';
      case IssueType.TASK: return '#0052CC';
      case IssueType.BUG: return '#DE350B';
      case IssueType.SUBTASK: return '#5E6C84';
      default: return '#0052CC';
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
