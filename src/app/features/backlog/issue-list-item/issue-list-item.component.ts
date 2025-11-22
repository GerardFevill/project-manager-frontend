import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { Issue } from '../../../core/services/issue.service';

@Component({
  selector: 'app-issue-list-item',
  standalone: true,
  imports: [CommonModule, IconComponent, BadgeComponent, AvatarComponent],
  template: `
    <div class="issue-item" (click)="onClick()">
      <div class="issue-checkbox" *ngIf="selectable" (click)="onSelect($event)">
        <input type="checkbox" [checked]="selected" />
      </div>

      <div class="issue-type" [class]="'type-' + issue.type">
        <jira-icon [name]="getIssueIcon(issue.type)" [size]="16" />
      </div>

      <div class="issue-content">
        <div class="issue-header">
          <span class="issue-key">{{ issue.key }}</span>
          <span class="issue-summary">{{ issue.summary }}</span>
        </div>

        <div class="issue-meta">
          <jira-badge
            [variant]="getPriorityVariant(issue.priority)"
            size="small"
          >
            {{ issue.priority }}
          </jira-badge>

          <span class="issue-status">{{ issue.status }}</span>

          <div class="issue-assignee" *ngIf="issue.assignee">
            <jira-avatar
              [name]="getUserDisplayName(issue.assignee)"
              [src]="issue.assignee.avatar"
              size="xsmall"
            />
            <span>{{ getUserDisplayName(issue.assignee) }}</span>
          </div>

          <span class="story-points" *ngIf="issue.storyPoints">
            <jira-icon name="issues" [size]="12" />
            {{ issue.storyPoints }}
          </span>
        </div>
      </div>

      <div class="issue-actions">
        <button class="action-btn" (click)="onEdit($event)" title="Edit">
          <jira-icon name="edit" [size]="16" />
        </button>
      </div>
    </div>
  `,
  styles: [`
    .issue-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-sm);
      background: var(--jira-neutral-0);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-50);
        border-color: var(--jira-brand-primary);
        box-shadow: var(--shadow-sm);

        .issue-actions {
          opacity: 1;
        }
      }
    }

    .issue-checkbox {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
    }

    .issue-type {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      flex-shrink: 0;

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

    .issue-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .issue-header {
      display: flex;
      align-items: baseline;
      gap: var(--spacing-sm);
    }

    .issue-key {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-600);
      flex-shrink: 0;
    }

    .issue-summary {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-1000);
      font-weight: var(--font-weight-medium);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .issue-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .issue-status {
      font-size: var(--font-size-xs);
      padding: 2px var(--spacing-xs);
      background: var(--jira-neutral-100);
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-700);
    }

    .issue-assignee {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-700);

      span {
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .story-points {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-700);
      font-weight: var(--font-weight-semibold);
    }

    .issue-actions {
      opacity: 0;
      display: flex;
      gap: var(--spacing-xs);
      transition: opacity var(--transition-fast);
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

    @media (max-width: 768px) {
      .issue-meta {
        flex-direction: column;
        align-items: flex-start;
      }

      .issue-actions {
        opacity: 1;
      }
    }
  `]
})
export class IssueListItemComponent {
  @Input() issue!: Issue;
  @Input() selectable = false;
  @Input() selected = false;

  @Output() itemClick = new EventEmitter<Issue>();
  @Output() editClick = new EventEmitter<Issue>();
  @Output() selectChange = new EventEmitter<boolean>();

  onClick(): void {
    this.itemClick.emit(this.issue);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.editClick.emit(this.issue);
  }

  onSelect(event: Event): void {
    event.stopPropagation();
    this.selectChange.emit(!this.selected);
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

  getUserDisplayName(user: any): string {
    if (!user) return 'Unknown';
    if (user.displayName) return user.displayName;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.username || user.email;
  }
}
