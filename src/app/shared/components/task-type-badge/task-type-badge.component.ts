import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TaskType } from '../../../core/models/task-type.enum';

/**
 * Task Type Badge Component
 *
 * Displays a colored badge with icon for the task type
 */
@Component({
  selector: 'app-task-type-badge',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule],
  template: `
    <mat-chip-set aria-label="Task type">
      <mat-chip [class]="'type-' + type">
        <mat-icon>{{ getIcon() }}</mat-icon>
        {{ getLabel() }}
      </mat-chip>
    </mat-chip-set>
  `,
  styles: [`
    mat-chip-set {
      display: inline-block;
    }

    mat-chip {
      font-size: 11px;
      min-height: 24px;
      padding: 4px 8px;
    }

    mat-chip mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      margin-right: 4px;
    }

    .type-task {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .type-project {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .type-epic {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .type-milestone {
      background-color: #e8f5e9;
      color: #388e3c;
    }
  `]
})
export class TaskTypeBadgeComponent {
  @Input() type: TaskType = TaskType.TASK;

  getIcon(): string {
    switch (this.type) {
      case TaskType.TASK:
        return 'check_circle';
      case TaskType.PROJECT:
        return 'folder';
      case TaskType.EPIC:
        return 'workspaces';
      case TaskType.MILESTONE:
        return 'flag';
      default:
        return 'help';
    }
  }

  getLabel(): string {
    switch (this.type) {
      case TaskType.TASK:
        return 'Tâche';
      case TaskType.PROJECT:
        return 'Projet';
      case TaskType.EPIC:
        return 'Epic';
      case TaskType.MILESTONE:
        return 'Jalon';
      default:
        return 'Unknown';
    }
  }
}
