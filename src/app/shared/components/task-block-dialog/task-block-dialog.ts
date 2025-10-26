import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Task } from '../../../core/models';

export interface BlockDialogData {
  task: Task;
}

export interface BlockDialogResult {
  reason?: string;
}

@Component({
  selector: 'app-task-block-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Bloquer la tâche</h2>
    <mat-dialog-content>
      <div class="dialog-content">
        <p class="task-title">{{ data.task.title }}</p>
        <mat-form-field appearance="outline" class="reason-field">
          <mat-label>Raison du blocage (optionnel)</mat-label>
          <textarea
            matInput
            [(ngModel)]="reason"
            placeholder="Ex: En attente de validation client, manque de ressources..."
            rows="4"
          ></textarea>
          <mat-hint>Cette information sera ajoutée à l'historique de la tâche</mat-hint>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Annuler</button>
      <button mat-raised-button color="warn" (click)="onBlock()">
        Bloquer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      border-radius: 6px !important;
      padding-left: 24px;
      padding-right: 24px;
      overflow-x: hidden;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
      min-width: 400px;
      overflow-x: hidden;
    }

    .task-title {
      font-weight: 500;
      color: var(--text-color);
      margin: 0;
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: 8px;
    }

    .reason-field {
      width: 100%;
    }

    textarea {
      resize: vertical;
      font-family: inherit;
    }

    mat-dialog-actions {
      padding: 8px 0;
      gap: 8px;
    }
  `]
})
export class TaskBlockDialogComponent {
  reason = '';

  constructor(
    public dialogRef: MatDialogRef<TaskBlockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BlockDialogData
  ) {}

  onBlock(): void {
    const result: BlockDialogResult = {
      reason: this.reason.trim() || undefined
    };
    this.dialogRef.close(result);
  }
}
