import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IssueService, Issue } from '../../../../core/services/issue.service';

@Component({
  selector: 'app-my-issues',
  standalone: true,
  imports: [CommonModule, CardComponent, IconComponent, BadgeComponent],
  template: `
    <jira-card [hasHeader]="true">
      <div header class="widget-header">
        <h3>My Issues</h3>
        <span class="issue-count">{{ issues().length }}</span>
      </div>

      <div class="issues-list">
        <div *ngFor="let issue of issues()" class="issue-item">
          <div class="issue-type" [class]="'type-' + issue.type">
            <jira-icon [name]="getIssueIcon(issue.type)" [size]="16" />
          </div>

          <div class="issue-content">
            <div class="issue-key">{{ issue.key }}</div>
            <div class="issue-summary">{{ issue.summary }}</div>
            <div class="issue-meta">
              <jira-badge [variant]="getPriorityVariant(issue.priority)" size="small">
                {{ issue.priority }}
              </jira-badge>
              <span class="issue-status">{{ issue.status }}</span>
            </div>
          </div>
        </div>

        <div *ngIf="issues().length === 0" class="empty-state">
          <jira-icon name="check" [size]="48" color="var(--jira-neutral-400)" />
          <p>No issues assigned to you</p>
        </div>
      </div>
    </jira-card>
  `,
  styles: [`
    .widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
    }

    .issue-count {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 24px;
      padding: 0 var(--spacing-sm);
      background: var(--jira-neutral-200);
      color: var(--jira-neutral-700);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      border-radius: 12px;
    }

    .issues-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .issue-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border-radius: var(--radius-sm);
      transition: background var(--transition-fast);
      cursor: pointer;

      &:hover {
        background: var(--jira-neutral-50);
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
    }

    .issue-content {
      flex: 1;
      min-width: 0;
    }

    .issue-key {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-600);
      margin-bottom: 2px;
    }

    .issue-summary {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-1000);
      margin-bottom: var(--spacing-xs);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .issue-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .issue-status {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl) var(--spacing-xl);
      text-align: center;

      p {
        margin-top: var(--spacing-md);
        color: var(--jira-neutral-600);
      }
    }
  `]
})
export class MyIssuesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  issues = signal<Issue[]>([]);
  loading = signal(true);

  constructor(private issueService: IssueService) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadIssues(): void {
    this.loading.set(true);

    this.issueService.getMyIssues(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (issues) => {
          this.issues.set(issues);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading my issues:', error);
          this.loading.set(false);
        }
      });
  }

  getIssueIcon(type: string): 'star' | 'check' | 'warning' | 'issues' {
    const icons: Record<string, 'star' | 'check' | 'warning' | 'issues'> = {
      story: 'star',
      task: 'check',
      bug: 'warning'
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
}
