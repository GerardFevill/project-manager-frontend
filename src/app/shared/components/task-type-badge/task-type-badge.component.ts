import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      font-weight: 600;
    }

    mat-chip mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      margin-right: 4px;
    }

    /* Task - Blue */
    .type-task {
      background-color: #e3f2fd;
      color: #1565c0;
      border: 1px solid #1976d2;
    }

    /* Project - Purple (plus visible) */
    .type-project {
      background-color: #f3e5f5;
      color: #6a1b9a;
      border: 2px solid #7b1fa2;
      font-weight: 700;
      font-size: 12px;
      min-height: 28px;
      padding: 6px 12px;
    }

    .type-project mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Epic - Orange */
    .type-epic {
      background-color: #fff3e0;
      color: #e65100;
      border: 1px solid #f57c00;
    }

    /* Milestone - Green */
    .type-milestone {
      background-color: #e8f5e9;
      color: #2e7d32;
      border: 1px solid #388e3c;
    }

    /* Mode dark */
    :root.dark-mode {
      .type-task {
        background-color: rgba(25, 118, 210, 0.2);
        color: #64b5f6;
        border-color: #1976d2;
      }

      .type-project {
        background-color: rgba(123, 31, 162, 0.25);
        color: #ba68c8;
        border-color: #9c27b0;
      }

      .type-epic {
        background-color: rgba(245, 124, 0, 0.2);
        color: #ffb74d;
        border-color: #f57c00;
      }

      .type-milestone {
        background-color: rgba(56, 142, 60, 0.2);
        color: #81c784;
        border-color: #66bb6a;
      }
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
