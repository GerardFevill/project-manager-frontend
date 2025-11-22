import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IssueService, Issue } from '../../../../core/services/issue.service';

interface EpicProgress {
  id: string;
  key: string;
  summary: string;
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  progress: number;
}

@Component({
  selector: 'app-epic-progress',
  standalone: true,
  imports: [CommonModule, IconComponent, BadgeComponent],
  template: `
    <div class="epic-progress-widget">
      <div class="widget-content">
        <div *ngIf="!loading(); else loadingState" class="epics-list">
          <div *ngFor="let epic of epics()" class="epic-item">
            <div class="epic-header">
              <div class="epic-info">
                <div class="epic-icon">
                  <jira-icon name="issues" [size]="16" />
                </div>
                <div class="epic-details">
                  <span class="epic-key">{{ epic.key }}</span>
                  <span class="epic-summary">{{ epic.summary }}</span>
                </div>
              </div>
              <span class="epic-count">{{ epic.completed }}/{{ epic.total }}</span>
            </div>

            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="epic.progress"></div>
            </div>

            <div class="epic-stats">
              <div class="stat-item">
                <jira-badge variant="default" size="small">
                  {{ epic.todo }} To Do
                </jira-badge>
              </div>
              <div class="stat-item">
                <jira-badge variant="info" size="small">
                  {{ epic.inProgress }} In Progress
                </jira-badge>
              </div>
              <div class="stat-item">
                <jira-badge variant="success" size="small">
                  {{ epic.completed }} Done
                </jira-badge>
              </div>
            </div>
          </div>

          <div *ngIf="epics().length === 0" class="empty-state">
            <jira-icon name="issues" [size]="48" color="var(--jira-neutral-400)" />
            <p>Aucun epic actif</p>
            <span>Créez un epic pour suivre sa progression</span>
          </div>
        </div>

        <ng-template #loadingState>
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des epics...</p>
          </div>
        </ng-template>

        <div *ngIf="error()" class="error-state">
          <jira-icon name="warning" [size]="48" color="var(--jira-danger)" />
          <p>{{ error() }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .epic-progress-widget {
      padding: var(--spacing-lg);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .widget-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .epics-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .epic-item {
      padding: var(--spacing-md);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-md);
      background: var(--jira-neutral-50);
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--jira-brand-primary);
        box-shadow: var(--shadow-sm);
      }
    }

    .epic-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-sm);
    }

    .epic-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 1;
      min-width: 0;
    }

    .epic-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      background: #EAE6FF;
      color: #6554C0;
      flex-shrink: 0;
    }

    .epic-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .epic-key {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-600);
    }

    .epic-summary {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-1000);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .epic-count {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-700);
      flex-shrink: 0;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--jira-neutral-200);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: var(--spacing-sm);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--jira-brand-primary), #4C9AFF);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .epic-stats {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
    }

    .empty-state,
    .loading-state,
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;
      flex: 1;

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
export class EpicProgressComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  epics = signal<EpicProgress[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private issueService: IssueService) {}

  ngOnInit(): void {
    this.loadEpics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEpics(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load epics (type='epic')
    this.issueService.getIssues({ type: ['epic'] }, 1, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const epics = response.items;

          // For each epic, calculate progress based on child issues
          const epicsProgress: EpicProgress[] = epics.map(epic => {
            // In a real implementation, this would load child issues
            // For now, using mock data
            const total = Math.floor(Math.random() * 30) + 10;
            const completed = Math.floor(Math.random() * total);
            const inProgress = Math.floor(Math.random() * (total - completed));
            const todo = total - completed - inProgress;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return {
              id: epic.id,
              key: epic.key,
              summary: epic.summary,
              total,
              completed,
              inProgress,
              todo,
              progress
            };
          });

          this.epics.set(epicsProgress);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading epics:', err);
          this.error.set('Erreur lors du chargement des epics');
          this.loading.set(false);
        }
      });
  }
}
