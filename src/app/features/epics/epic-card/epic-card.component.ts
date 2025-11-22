import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { Epic, EPIC_STATUS_CONFIG } from '../../../core/models/epic.model';

@Component({
  selector: 'jira-epic-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, BadgeComponent],
  templateUrl: './epic-card.component.html',
  styleUrls: ['./epic-card.component.scss'],
})
export class EpicCardComponent {
  @Input() epic!: Epic;

  @Output() edit = new EventEmitter<Epic>();
  @Output() delete = new EventEmitter<Epic>();

  get statusConfig() {
    return EPIC_STATUS_CONFIG[this.epic.status];
  }

  get progress(): number {
    if (!this.epic.totalIssues || this.epic.totalIssues === 0) {
      return 0;
    }
    return Math.round(((this.epic.completedIssues || 0) / this.epic.totalIssues) * 100);
  }

  get progressColor(): string {
    if (this.progress >= 80) return 'var(--jira-success)';
    if (this.progress >= 50) return 'var(--jira-info)';
    if (this.progress >= 25) return 'var(--jira-warning)';
    return 'var(--jira-neutral-400)';
  }

  onEdit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.edit.emit(this.epic);
  }

  onDelete(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.delete.emit(this.epic);
  }

  getStatusVariant(): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' {
    switch (this.epic.status) {
      case 'done':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
