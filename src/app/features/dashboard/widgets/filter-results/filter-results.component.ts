import { Component, OnInit, signal, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IssueService, Issue } from '../../../../core/services/issue.service';
import { FilterService } from '../../../../core/services/filter.service';

@Component({
  selector: 'app-filter-results',
  standalone: true,
  imports: [CommonModule, IconComponent, BadgeComponent],
  template: `
    <div class="filter-results-widget">
      <div class="filter-header">
        <div class="filter-info">
          <jira-icon name="filter" [size]="20" color="var(--jira-brand-primary)" />
          <span class="filter-name">{{ getFilterName() }}</span>
        </div>
        <span class="result-count">{{ issues().length }} résultats</span>
      </div>

      <div class="issues-list" *ngIf="!loading(); else loadingState">
        <div *ngFor="let issue of issues()" class="issue-item">
          <div class="issue-type" [class]="'type-' + issue.type">
            <jira-icon [name]="getIssueIcon(issue.type)" [size]="16" />
          </div>

          <div class="issue-content">
            <div class="issue-header">
              <span class="issue-key">{{ issue.key }}</span>
              <jira-badge [variant]="getPriorityVariant(issue.priority)" size="small">
                {{ issue.priority }}
              </jira-badge>
            </div>
            <div class="issue-summary">{{ issue.summary }}</div>
            <div class="issue-meta">
              <span class="issue-status">{{ issue.status }}</span>
              <span class="issue-assignee" *ngIf="issue.assignee">
                <jira-icon name="user" [size]="12" />
                {{ getUserDisplayName(issue.assignee) }}
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="issues().length === 0" class="empty-state">
          <jira-icon name="filter" [size]="48" color="var(--jira-neutral-400)" />
          <p>Aucun résultat</p>
          <span>Aucune issue ne correspond aux critères du filtre</span>
        </div>
      </div>

      <ng-template #loadingState>
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Chargement des résultats...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .filter-results-widget {
      padding: var(--spacing-lg);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .filter-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-md);
      border-bottom: 2px solid var(--jira-neutral-200);
    }

    .filter-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .filter-name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
    }

    .result-count {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      background: var(--jira-neutral-100);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
    }

    .issues-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .issue-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      cursor: pointer;

      &:hover {
        background: var(--jira-neutral-50);
        border-color: var(--jira-brand-primary);
        box-shadow: var(--shadow-sm);
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
    }

    .issue-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-xs);
    }

    .issue-key {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-600);
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
      gap: var(--spacing-md);
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
    }

    .issue-status {
      padding: 2px var(--spacing-xs);
      background: var(--jira-neutral-100);
      border-radius: var(--radius-sm);
    }

    .issue-assignee {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;

      p {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--jira-neutral-800);
        margin: var(--spacing-md) 0 var(--spacing-xs) 0;
      }

      span {
        color: var(--jira-neutral-600);
        font-size: var(--font-size-sm);
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;

      p {
        margin-top: var(--spacing-md);
        color: var(--jira-neutral-600);
      }
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--jira-neutral-200);
      border-top-color: var(--jira-brand-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class FilterResultsComponent implements OnInit, OnDestroy {
  @Input() filterId?: string;

  private destroy$ = new Subject<void>();

  issues = signal<Issue[]>([]);
  loading = signal(true);

  constructor(
    private issueService: IssueService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadIssues(): void {
    this.loading.set(true);

    // Get active filter or use provided filter ID
    const activeFilter = this.filterService.activeFilter();

    if (!activeFilter && !this.filterId) {
      this.loading.set(false);
      return;
    }

    // Load all issues and apply filter
    this.issueService.getIssues({}, 1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          let filteredIssues = response.items;

          // Apply active filter if exists
          if (activeFilter) {
            filteredIssues = this.filterService.applyFilter(
              filteredIssues,
              activeFilter,
              (item, field) => {
                // Map filter fields to issue properties
                switch (field) {
                  case 'assignee': return item.assignee?.id;
                  case 'reporter': return item.reporter?.id;
                  case 'sprint': return item.sprint?.id;
                  case 'project': return item.project?.id;
                  default: return (item as any)[field];
                }
              }
            );
          }

          this.issues.set(filteredIssues);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading filter results:', error);
          this.loading.set(false);
        }
      });
  }

  getFilterName(): string {
    const activeFilter = this.filterService.activeFilter();
    return activeFilter?.name || 'Filtre personnalisé';
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
