import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { TaskService, NotificationService } from '../../../core/services';
import { Task, TaskStatus } from '../../../core/models';
import { TASK_MESSAGES } from '../../../core/constants/messages';
import {
  TaskStatusBadgeComponent,
  TaskProgressBarComponent,
  CreateTaskDialogComponent,
  ConfirmDialogComponent,
  TaskBlockDialogComponent
} from '../../../shared/components';
import { TaskTypeBadgeComponent } from '../../../shared/components/task-type-badge/task-type-badge.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    TaskStatusBadgeComponent,
    TaskProgressBarComponent,
    TaskTypeBadgeComponent
  ],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.scss'
})
export class TaskDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  task = signal<Task | null>(null);
  loading = signal(true);
  TaskStatus = TaskStatus;

  ngOnInit() {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.loadTask(taskId);
    }
  }

  loadTask(id: string) {
    this.loading.set(true);
    this.taskService.findOne(id, true).subscribe({
      next: (task) => {
        this.task.set(task);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading task:', err);
        this.notificationService.error('Erreur lors du chargement de la tâche');
        this.loading.set(false);
        this.router.navigate(['/tasks']);
      }
    });
  }

  editTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      data: currentTask
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.update(currentTask.id, result).subscribe({
          next: () => {
            this.notificationService.success(TASK_MESSAGES.UPDATED);
            this.loadTask(currentTask.id);
          },
          error: (err) => {
            console.error('Error updating task:', err);
            this.notificationService.error(TASK_MESSAGES.UPDATE_ERROR);
          }
        });
      }
    });
  }

  toggleTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    this.taskService.toggle(currentTask.id).subscribe({
      next: () => {
        this.notificationService.success(TASK_MESSAGES.UPDATED);
        this.loadTask(currentTask.id);
      },
      error: (err) => {
        console.error('Error toggling task:', err);
        this.notificationService.error(TASK_MESSAGES.UPDATE_ERROR);
      }
    });
  }

  blockTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    const dialogRef = this.dialog.open(TaskBlockDialogComponent, {
      data: { task: currentTask }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.blockTask(currentTask.id, result.reason).subscribe({
          next: () => {
            this.notificationService.success('Tâche bloquée avec succès');
            this.loadTask(currentTask.id);
          },
          error: (err) => {
            console.error('Error blocking task:', err);
            this.notificationService.error('Erreur lors du blocage de la tâche');
          }
        });
      }
    });
  }

  unblockTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    this.taskService.unblockTask(currentTask.id).subscribe({
      next: () => {
        this.notificationService.success('Tâche débloquée avec succès');
        this.loadTask(currentTask.id);
      },
      error: (err) => {
        console.error('Error unblocking task:', err);
        this.notificationService.error('Erreur lors du déblocage de la tâche');
      }
    });
  }

  archiveTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Archiver la tâche',
        message: 'Êtes-vous sûr de vouloir archiver cette tâche ?',
        confirmText: 'Archiver',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.archiveTask(currentTask.id).subscribe({
          next: () => {
            this.notificationService.success('Tâche archivée avec succès');
            this.router.navigate(['/tasks']);
          },
          error: (err) => {
            console.error('Error archiving task:', err);
            this.notificationService.error('Erreur lors de l\'archivage');
          }
        });
      }
    });
  }

  deleteTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: TASK_MESSAGES.CONFIRM_DELETE
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.remove(currentTask.id).subscribe({
          next: () => {
            this.notificationService.success(TASK_MESSAGES.DELETED);
            this.router.navigate(['/tasks']);
          },
          error: (err) => {
            console.error('Error deleting task:', err);
            this.notificationService.error(TASK_MESSAGES.DELETE_ERROR);
          }
        });
      }
    });
  }

  convertToProject() {
    const currentTask = this.task();
    if (!currentTask) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Convertir en projet',
        message: 'Voulez-vous convertir cette tâche en projet ?',
        confirmText: 'Convertir',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.convertToProject(currentTask.id).subscribe({
          next: () => {
            this.notificationService.success('Tâche convertie en projet avec succès');
            this.loadTask(currentTask.id);
          },
          error: (err) => {
            console.error('Error converting to project:', err);
            this.notificationService.error('Erreur lors de la conversion');
          }
        });
      }
    });
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status !== TaskStatus.COMPLETED;
  }

  formatDate(date: string | Date | undefined | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(date: string | Date | undefined | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
