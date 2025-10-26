import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TaskStatus, TaskStatusHelper } from '../../../core/models';

@Component({
  selector: 'app-task-status-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="status-badge" [style.background-color]="backgroundColor" [style.color]="textColor">
      <mat-icon class="status-icon">{{ icon }}</mat-icon>
      <span class="status-label">{{ label }}</span>
    </div>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    .status-badge:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .status-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .status-label {
      line-height: 1;
    }
  `]
})
export class TaskStatusBadgeComponent {
  @Input({ required: true }) status!: TaskStatus;
  @Input() showIcon = true;

  get label(): string {
    return TaskStatusHelper.getLabel(this.status);
  }

  get icon(): string {
    return TaskStatusHelper.getIcon(this.status);
  }

  get backgroundColor(): string {
    return TaskStatusHelper.getColor(this.status);
  }

  get textColor(): string {
    return '#ffffff';
  }
}
