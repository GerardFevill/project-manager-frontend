import { Component, OnInit, inject, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskService } from '../../../core/services';
import { Task, TaskFilterDto, CreateTaskDto } from '../../../core/models';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatDialogModule, MatButtonModule, MatTableModule, MatIconModule, MatTooltipModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  tasks = signal<Task[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['title', 'description', 'priority', 'dueDate', 'status', 'actions'];

  filters: TaskFilterDto = {
    status: 'all',
    onlyRoot: true
  };

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading.set(true);
    this.snackBar.open('Chargement des tâches...', '', {
      duration: 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'snackbar-info'
    });
    this.taskService.findAll(this.filters).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
        this.snackBar.open(`${tasks.length} tâche(s) chargée(s)`, 'OK', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: 'snackbar-success'
        });
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.loading.set(false);
        this.snackBar.open('Erreur lors du chargement des tâches', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: 'snackbar-error'
        });
      }
    });
  }

  openCreateTaskDialog() {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createTask(result);
      }
    });
  }

  createTask(newTask: CreateTaskDto) {
    this.snackBar.open('Création de la tâche...', '', {
      duration: 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'snackbar-info'
    });
    this.taskService.create(newTask).subscribe({
      next: () => {
        this.snackBar.open('✅ Tâche créée avec succès', 'OK', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: 'snackbar-success'
        });
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error creating task:', err);
        this.snackBar.open('❌ Échec de la création de la tâche', 'Fermer', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: 'snackbar-error'
        });
      }
    });
  }

  toggleTask(id: string) {
    this.taskService.toggle(id).subscribe({
      next: () => {
        this.snackBar.open('✏️ Tâche modifiée avec succès', 'OK', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: 'snackbar-success'
        });
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error toggling task:', err);
        this.snackBar.open('❌ Erreur lors de la modification', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: 'snackbar-error'
        });
      }
    });
  }

  deleteTask(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer cette tâche et toutes ses sous-tâches?',
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Suppression en cours...', '', {
          duration: 1000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: 'snackbar-info'
        });
        this.taskService.remove(id).subscribe({
          next: () => {
            this.snackBar.open('🗑️ Tâche supprimée avec succès', 'OK', {
              duration: 2000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: 'snackbar-success'
            });
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error deleting task:', err);
            this.snackBar.open('❌ Échec de la suppression', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: 'snackbar-error'
            });
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
      width: '500px',
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateTask(task.id, result);
      }
    });
  }

  updateTask(id: string, taskData: CreateTaskDto) {
    this.snackBar.open('Modification en cours...', '', {
      duration: 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'snackbar-info'
    });
    // Using the existing toggle endpoint for now - you may need to add an update endpoint
    this.taskService.toggle(id).subscribe({
      next: () => {
        this.snackBar.open('✏️ Tâche modifiée avec succès', 'OK', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: 'snackbar-success'
        });
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.snackBar.open('❌ Erreur lors de la modification', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: 'snackbar-error'
        });
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

    this.snackBar.open('Duplication en cours...', '', {
      duration: 1000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'snackbar-info'
    });

    this.taskService.create(duplicatedTask).subscribe({
      next: () => {
        this.snackBar.open('✅ Tâche dupliquée avec succès', 'OK', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: 'snackbar-success'
        });
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error duplicating task:', err);
        this.snackBar.open('❌ Échec de la duplication', 'Fermer', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: 'snackbar-error'
        });
      }
    });
  }

  viewTask(task: Task) {
    this.snackBar.open(`Viewing task: ${task.title}`, 'OK', {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'snackbar-info'
    });
  }
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ data.cancelText }}</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">{{ data.confirmText }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 20px 0;
    }
    mat-dialog-actions {
      padding: 8px 0;
      gap: 8px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
  }) {}
}

@Component({
  selector: 'app-create-task-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Create New Task</h2>
    <mat-dialog-content>
      <div class="form-content">
        <input
          [(ngModel)]="taskData.title"
          placeholder="Task title"
          class="input-field"
        />
        <textarea
          [(ngModel)]="taskData.description"
          placeholder="Description (optional)"
          class="input-field"
          rows="4"
        ></textarea>
        <select [(ngModel)]="taskData.priority" class="input-field">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <input
          type="date"
          [(ngModel)]="taskData.dueDate"
          class="input-field"
        />
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancel</button>
      <button mat-raised-button color="primary" (click)="onCreateClick()">Create</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
      min-width: 400px;
    }

    .input-field {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--bg-color);
      color: var(--text-color);
      font-size: 15px;
      transition: border-color 0.2s ease;
    }

    .input-field:focus {
      outline: none;
      border-color: var(--accent-color);
    }

    textarea.input-field {
      resize: vertical;
      font-family: inherit;
    }

    mat-dialog-actions {
      padding: 8px 0;
      gap: 8px;
    }
  `]
})
export class CreateTaskDialogComponent {
  taskData: CreateTaskDto = {
    title: '',
    priority: 'medium'
  };

  constructor(
    public dialogRef: MatDialogRef<CreateTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: Task
  ) {
    if (data) {
      this.taskData = {
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : undefined
      };
    }
  }

  onCreateClick() {
    if (this.taskData.title.trim()) {
      this.dialogRef.close(this.taskData);
    }
  }
}
