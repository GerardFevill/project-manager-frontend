import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Sprint } from '../../../core/services/sprint.service';

@Component({
  selector: 'app-sprint-card',
  standalone: true,
  imports: [CommonModule, IconComponent, BadgeComponent, ButtonComponent],
  template: `
    <div class="sprint-card" [class.active]="sprint.status === 'active'">
      <div class="card-header">
        <div class="header-left">
          <jira-icon name="issues" [size]="20" />
          <h3>{{ sprint.name }}</h3>
          <jira-badge
            [variant]="getStatusVariant(sprint.status)"
            size="small"
          >
            {{ getStatusLabel(sprint.status) }}
          </jira-badge>
        </div>

        <div class="header-actions">
          <button class="action-btn" (click)="onView($event)" title="View Details">
            <jira-icon name="menu" [size]="16" />
          </button>
        </div>
      </div>

      <div class="card-content">
        <p class="sprint-goal" *ngIf="sprint.goal">{{ sprint.goal }}</p>

        <div class="sprint-dates">
          <div class="date-item">
            <jira-icon name="calendar" [size]="14" />
            <span>{{ formatDate(sprint.startDate) }} - {{ formatDate(sprint.endDate) }}</span>
          </div>
          <div class="date-item">
            <jira-icon name="clock" [size]="14" />
            <span>{{ getDaysRemaining(sprint) }}</span>
          </div>
        </div>

        <div class="sprint-stats" *ngIf="sprint.stats">
          <div class="stat-item">
            <span class="stat-label">Issues</span>
            <span class="stat-value">{{ sprint.stats.totalIssues }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Done</span>
            <span class="stat-value stat-success">{{ sprint.stats.completedIssues }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Points</span>
            <span class="stat-value">{{ sprint.stats.completedStoryPoints }} / {{ sprint.stats.totalStoryPoints }}</span>
          </div>
        </div>

        <div class="progress-bar" *ngIf="sprint.stats">
          <div
            class="progress-fill"
            [style.width.%]="getCompletionPercentage(sprint)"
          ></div>
        </div>
      </div>

      <div class="card-footer">
        <jira-button
          *ngIf="sprint.status === 'planned'"
          variant="primary"
          size="small"
          (clicked)="onStart($event)"
        >
          <jira-icon leftIcon name="sprint" [size]="14" />
          Start Sprint
        </jira-button>

        <jira-button
          *ngIf="sprint.status === 'active'"
          variant="subtle"
          size="small"
          (clicked)="onComplete($event)"
        >
          <jira-icon leftIcon name="check" [size]="14" />
          Complete Sprint
        </jira-button>

        <jira-button
          variant="subtle"
          size="small"
          (clicked)="onView($event)"
        >
          View Details
        </jira-button>
      </div>
    </div>
  `,
  styles: [`
    .sprint-card {
      background: var(--jira-neutral-0);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      transition: all var(--transition-fast);

      &:hover {
        box-shadow: var(--shadow-md);
        border-color: var(--jira-brand-primary);
      }

      &.active {
        border: 2px solid var(--jira-info);
        background: var(--jira-info-bg);
      }
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-md);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 1;
      min-width: 0;

      h3 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--jira-neutral-1000);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-xs);
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-700);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-200);
        color: var(--jira-neutral-1000);
      }
    }

    .card-content {
      margin-bottom: var(--spacing-md);
    }

    .sprint-goal {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-700);
      margin: 0 0 var(--spacing-md) 0;
      line-height: 1.5;
    }

    .sprint-dates {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-md);
    }

    .date-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
    }

    .sprint-stats {
      display: flex;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-sm);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-label {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);

      &.stat-success {
        color: var(--jira-success);
      }
    }

    .progress-bar {
      height: 8px;
      background: var(--jira-neutral-200);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--jira-success), #36B37E);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .card-footer {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }
  `]
})
export class SprintCardComponent {
  @Input() sprint!: Sprint;
  @Output() startSprint = new EventEmitter<Sprint>();
  @Output() completeSprint = new EventEmitter<Sprint>();
  @Output() viewSprint = new EventEmitter<Sprint>();

  onStart(event: Event): void {
    event.stopPropagation();
    this.startSprint.emit(this.sprint);
  }

  onComplete(event: Event): void {
    event.stopPropagation();
    this.completeSprint.emit(this.sprint);
  }

  onView(event: Event): void {
    event.stopPropagation();
    this.viewSprint.emit(this.sprint);
  }

  getStatusVariant(status: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' {
    const variants: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
      planned: 'default',
      active: 'info',
      completed: 'success'
    };
    return variants[status] || 'default';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      planned: 'Planned',
      active: 'Active',
      completed: 'Completed'
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getDaysRemaining(sprint: Sprint): string {
    if (sprint.status === 'completed') return 'Completed';

    const now = new Date();
    const endDate = new Date(sprint.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  }

  getCompletionPercentage(sprint: Sprint): number {
    if (!sprint.stats || sprint.stats.totalStoryPoints === 0) return 0;
    return Math.round((sprint.stats.completedStoryPoints / sprint.stats.totalStoryPoints) * 100);
  }
}
