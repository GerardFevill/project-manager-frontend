import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TaskStatus, TaskStatusHelper } from '../../../core/models';

@Component({
  selector: 'app-task-status-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './task-status-badge.html',
  styleUrl: './task-status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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
