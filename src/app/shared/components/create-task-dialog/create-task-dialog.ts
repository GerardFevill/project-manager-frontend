import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CreateTaskDto, Task } from '../../../core/models';

@Component({
  selector: 'app-create-task-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Modifier la tâche' : 'Créer une nouvelle tâche' }}</h2>
    <mat-dialog-content>
      <div class="form-content">
        <input
          [(ngModel)]="taskData.title"
          placeholder="Titre de la tâche"
          class="input-field"
        />
        <textarea
          [(ngModel)]="taskData.description"
          placeholder="Description (optionnel)"
          class="input-field"
          rows="4"
        ></textarea>
        <select [(ngModel)]="taskData.priority" class="input-field">
          <option value="low">Faible</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="urgent">Urgente</option>
        </select>
        <input
          type="date"
          [(ngModel)]="taskData.dueDate"
          class="input-field"
          placeholder="Date d'échéance"
        />
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Annuler</button>
      <button mat-raised-button color="primary" (click)="onSubmit()">
        {{ data ? 'Modifier' : 'Créer' }}
      </button>
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

  onSubmit() {
    if (this.taskData.title.trim()) {
      this.dialogRef.close(this.taskData);
    }
  }
}
