import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { Issue } from '../../../core/services/issue.service';

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [CommonModule, IconComponent, BadgeComponent, AvatarComponent],
  template: `
    <div class="kanban-card" (click)="onClick()">
      <div class="card-header">
        <span class="issue-key">{{ issue.key }}</span>
        <div class="issue-type" [class]="'type-' + issue.type">
          <jira-icon [name]="getIssueIcon(issue.type)" [size]="14" />
        </div>
      </div>

      <p class="issue-summary">{{ issue.summary }}</p>

      <div class="card-footer">
        <div class="card-meta">
          <jira-badge
            *ngIf="issue.priority"
            [variant]="getPriorityVariant(issue.priority)"
            size="small"
          >
            {{ getPriorityLabel(issue.priority) }}
          </jira-badge>

          <span class="story-points" *ngIf="issue.storyPoints">
            <jira-icon name="issues" [size]="12" />
            {{ issue.storyPoints }}
          </span>
        </div>

        <jira-avatar
          *ngIf="issue.assignee"
          [name]="getUserDisplayName(issue.assignee)"
          [src]="issue.assignee.avatar"
          size="xsmall"
        />
      </div>
    </div>
  `,
  styles: [`
    .kanban-card {
      background: var(--jira-neutral-0);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-md);
      padding: var(--spacing-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);

      &:hover {
        border-color: var(--jira-brand-primary);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-sm);
    }

    .issue-key {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-600);
    }

    .issue-type {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);

      &.type-story {
        background: #E3FCEF;
        color: var(--jira-success);
      }

      &.type-task {
        background: #DEEBFF;
        color: var(--jira-info);
      }

      &.type-bug {
        background: #FFEBE6;
        color: var(--jira-danger);
      }

      &.type-epic {
        background: #EAE6FF;
        color: #6554C0;
      }
    }

    .issue-summary {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-1000);
      font-weight: var(--font-weight-medium);
      margin: 0 0 var(--spacing-md) 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-sm);
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 1;
      min-width: 0;
    }

    .story-points {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-700);
      font-weight: var(--font-weight-semibold);
    }
  `]
})
export class KanbanCardComponent {
  @Input() issue!: Issue;
  @Output() cardClick = new EventEmitter<Issue>();

  onClick(): void {
    this.cardClick.emit(this.issue);
  }

  getIssueIcon(type: string): 'star' | 'check' | 'warning' | 'issues' {
    const icons: Record<string, 'star' | 'check' | 'warning' | 'issues'> = {
      story: 'star',
      task: 'check',
      bug: 'warning',
      epic: 'issues'
    };
    return icons[type] || 'issues';
  }

  getPriorityVariant(priority: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' {
    const variants: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
      lowest: 'default',
      low: 'default',
      medium: 'info',
      high: 'warning',
      highest: 'danger'
    };
    return variants[priority] || 'default';
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      highest: 'P1',
      high: 'P2',
      medium: 'P3',
      low: 'P4',
      lowest: 'P5'
    };
    return labels[priority] || priority;
  }

  getUserDisplayName(user: any): string {
    if (!user) return 'Unknown';
    if (user.displayName) return user.displayName;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.username || user.email;
  }
}
