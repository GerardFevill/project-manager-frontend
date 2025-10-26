import { Component, Inject } from '@angular/core';
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
  template: `
    <h2 mat-dialog-title>{{ data ? 'Modifier la tâche' : 'Créer une nouvelle tâche' }}</h2>
    <mat-dialog-content>
      <div class="form-content">
        <!-- Title -->
        <input
          [(ngModel)]="taskData.title"
          placeholder="Titre de la tâche"
          class="input-field"
        />

        <!-- Description -->
        <textarea
          [(ngModel)]="taskData.description"
          placeholder="Description (optionnel)"
          class="input-field"
          rows="4"
        ></textarea>

        <!-- Status & Priority -->
        <div class="row">
          <select [(ngModel)]="taskData.status" class="input-field">
            <option [value]="TaskStatus.DRAFT">Brouillon</option>
            <option [value]="TaskStatus.ACTIVE">Active</option>
            <option [value]="TaskStatus.COMPLETED">Terminée</option>
            <option [value]="TaskStatus.BLOCKED">Bloquée</option>
            <option [value]="TaskStatus.RECURRING">Récurrente</option>
          </select>

          <select [(ngModel)]="taskData.priority" class="input-field">
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        <!-- Progress Slider -->
        <div class="progress-section">
          <label class="field-label">Progression: {{ taskData.progress }}%</label>
          <mat-slider
            min="0"
            max="100"
            step="5"
            discrete
            [displayWith]="formatLabel"
          >
            <input matSliderThumb [(ngModel)]="taskData.progress">
          </mat-slider>
        </div>

        <!-- Dates -->
        <div class="row">
          <input
            type="date"
            [(ngModel)]="taskData.startDate"
            class="input-field"
            placeholder="Date de début"
          />
          <input
            type="date"
            [(ngModel)]="taskData.dueDate"
            class="input-field"
            placeholder="Date d'échéance"
          />
        </div>

        <!-- Recurrence -->
        <app-task-recurrence-selector
          [(ngModel)]="taskData.recurrence"
        ></app-task-recurrence-selector>

        @if (taskData.recurrence && taskData.recurrence !== TaskRecurrence.NONE) {
          <input
            type="datetime-local"
            [(ngModel)]="taskData.nextOccurrence"
            class="input-field"
            placeholder="Prochaine occurrence"
          />
        }

        <!-- Time tracking -->
        <div class="row">
          <input
            type="number"
            [(ngModel)]="taskData.estimatedHours"
            placeholder="Heures estimées"
            class="input-field"
            min="0"
            step="0.5"
          />
          @if (data) {
            <input
              type="number"
              [(ngModel)]="taskData.actualHours"
              placeholder="Heures réelles"
              class="input-field"
              min="0"
              step="0.5"
            />
          }
        </div>

        <!-- Tags -->
        <app-task-tags-input
          [(ngModel)]="taskData.tags"
        ></app-task-tags-input>
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
      min-width: 500px;
      max-width: 600px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
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

    .progress-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color);
    }

    mat-slider {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 8px 0;
      gap: 8px;
    }
  `]
})
export class CreateTaskDialogComponent {
  TaskStatus = TaskStatus;
  TaskRecurrence = TaskRecurrence;

  taskData: CreateTaskDto = {
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
      this.dialogRef.close(this.taskData);
    }
  }
}
