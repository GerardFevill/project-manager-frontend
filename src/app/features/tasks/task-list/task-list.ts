import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { TaskService, NotificationService } from '../../../core/services';
import { Task, TaskFilterDto, CreateTaskDto, UpdateTaskDto, TaskStatus } from '../../../core/models';
import { TASK_MESSAGES } from '../../../core/constants/messages';
import {
  ConfirmDialogComponent,
  CreateTaskDialogComponent,
  TaskStatusBadgeComponent,
  TaskProgressBarComponent,
  TaskBlockDialogComponent
} from '../../../shared/components';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    TaskStatusBadgeComponent,
    TaskProgressBarComponent
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  tasks = signal<Task[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['status', 'title', 'progress', 'priority', 'tags', 'dueDate', 'actions'];
  TaskStatus = TaskStatus;

  filters: TaskFilterDto = {
    status: 'all',
    onlyRoot: true
  };

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading.set(true);
    this.notificationService.info(TASK_MESSAGES.LOADING);

    this.taskService.findAll(this.filters).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
        this.notificationService.success(TASK_MESSAGES.LOADED(tasks.length));
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.loading.set(false);
        this.notificationService.error(TASK_MESSAGES.LOAD_ERROR);
      }
    });
  }

  openCreateTaskDialog() {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createTask(result);
      }
    });
  }

  createTask(newTask: CreateTaskDto) {
    this.notificationService.info(TASK_MESSAGES.CREATING);

    this.taskService.create(newTask).subscribe({
      next: () => {
        this.notificationService.success(TASK_MESSAGES.CREATED, 3000);
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error creating task:', err);
        this.notificationService.error(TASK_MESSAGES.CREATE_ERROR, 4000);
      }
    });
  }

  toggleTask(id: string) {
    this.taskService.toggle(id).subscribe({
      next: () => {
        this.notificationService.success(TASK_MESSAGES.UPDATED);
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error toggling task:', err);
        this.notificationService.error(TASK_MESSAGES.UPDATE_ERROR);
      }
    });
  }

  deleteTask(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: TASK_MESSAGES.CONFIRM_DELETE
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.info(TASK_MESSAGES.DELETING);

        this.taskService.remove(id).subscribe({
          next: () => {
            this.notificationService.success(TASK_MESSAGES.DELETED);
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error deleting task:', err);
            this.notificationService.error(TASK_MESSAGES.DELETE_ERROR);
          }
        });
      }
    });
  }

  viewChildren(id: string) {
    this.filters.parentId = id;
    this.filters.onlyRoot = false;
    this.loadTasks();
  }

  editTask(task: Task) {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateTask(task.id, result);
      }
    });
  }

  updateTask(id: string, taskData: UpdateTaskDto) {
    this.notificationService.info(TASK_MESSAGES.UPDATING);

    this.taskService.update(id, taskData).subscribe({
      next: () => {
        this.notificationService.success(TASK_MESSAGES.UPDATED);
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.notificationService.error(TASK_MESSAGES.UPDATE_ERROR);
      }
    });
  }

  duplicateTask(task: Task) {
    const duplicatedTask: CreateTaskDto = {
      title: `${task.title} (copie)`,
      description: task.description || undefined,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined
    };

    this.notificationService.info(TASK_MESSAGES.DUPLICATING);

    this.taskService.create(duplicatedTask).subscribe({
      next: () => {
        this.notificationService.success(TASK_MESSAGES.DUPLICATED, 3000);
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error duplicating task:', err);
        this.notificationService.error(TASK_MESSAGES.DUPLICATE_ERROR, 4000);
      }
    });
  }

  viewTask(task: Task) {
    this.notificationService.info(TASK_MESSAGES.VIEWING(task.title));
  }

  // ========================================================================
  // NEW ACTIONS: Block, Archive, Progress
  // ========================================================================

  blockTask(task: Task) {
    const dialogRef = this.dialog.open(TaskBlockDialogComponent, {
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.info('Blocage de la tâche...');

        this.taskService.blockTask(task.id, result.reason).subscribe({
          next: () => {
            this.notificationService.success('Tâche bloquée avec succès');
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error blocking task:', err);
            this.notificationService.error('Erreur lors du blocage de la tâche');
          }
        });
      }
    });
  }

  unblockTask(id: string) {
    this.notificationService.info('Déblocage de la tâche...');

    this.taskService.unblockTask(id).subscribe({
      next: () => {
        this.notificationService.success('Tâche débloquée avec succès');
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error unblocking task:', err);
        this.notificationService.error('Erreur lors du déblocage de la tâche');
      }
    });
  }

  archiveTask(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: 'Êtes-vous sûr de vouloir archiver cette tâche ?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.info('Archivage de la tâche...');

        this.taskService.archiveTask(id).subscribe({
          next: () => {
            this.notificationService.success('Tâche archivée avec succès');
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error archiving task:', err);
            this.notificationService.error('Erreur lors de l\'archivage de la tâche');
          }
        });
      }
    });
  }

  unarchiveTask(id: string) {
    this.notificationService.info('Restauration de la tâche...');

    this.taskService.unarchiveTask(id).subscribe({
      next: () => {
        this.notificationService.success('Tâche restaurée avec succès');
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error unarchiving task:', err);
        this.notificationService.error('Erreur lors de la restauration de la tâche');
      }
    });
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status !== TaskStatus.COMPLETED;
  }

  sortData(sort: Sort) {
    const data = this.tasks().slice();

    if (!sort.active || sort.direction === '') {
      this.tasks.set(data);
      return;
    }

    const sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';

      switch (sort.active) {
        case 'title':
          return this.compare(a.title.toLowerCase(), b.title.toLowerCase(), isAsc);

        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
          return this.compare(
            priorityOrder[a.priority] || 0,
            priorityOrder[b.priority] || 0,
            isAsc
          );

        case 'progress':
          return this.compare(a.progress || 0, b.progress || 0, isAsc);

        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          return this.compare(dateA, dateB, isAsc);

        default:
          return 0;
      }
    });

    this.tasks.set(sortedData);
  }

  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
