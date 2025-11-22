import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { AnalyticsService } from '../../../../core/services/analytics.service';

interface TeamMemberWorkload {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  assignedIssues: number;
  completedIssues: number;
  inProgressIssues: number;
  workloadPercentage: number;
  capacity: number;
}

@Component({
  selector: 'app-team-workload',
  standalone: true,
  imports: [CommonModule, IconComponent, BadgeComponent, AvatarComponent],
  template: `
    <div class="team-workload-widget">
      <div class="widget-header">
        <h3>Charge d'équipe</h3>
        <div class="team-count">
          <jira-icon name="user" [size]="16" />
          <span>{{ members().length }} membres</span>
        </div>
      </div>

      <div class="widget-content">
        <div *ngIf="!loading(); else loadingState" class="members-list">
          <div *ngFor="let member of members()" class="member-item">
            <div class="member-header">
              <div class="member-info">
                <jira-avatar
                  [name]="member.name"
                  [src]="member.avatar"
                  size="medium"
                />
                <div class="member-details">
                  <span class="member-name">{{ member.name }}</span>
                  <span class="member-email">{{ member.email }}</span>
                </div>
              </div>

              <jira-badge
                [variant]="getWorkloadVariant(member.workloadPercentage)"
                size="small"
              >
                {{ member.workloadPercentage }}%
              </jira-badge>
            </div>

            <div class="workload-bar">
              <div
                class="workload-fill"
                [style.width.%]="member.workloadPercentage"
                [class.high]="member.workloadPercentage >= 80"
                [class.medium]="member.workloadPercentage >= 50 && member.workloadPercentage < 80"
                [class.low]="member.workloadPercentage < 50"
              ></div>
            </div>

            <div class="member-stats">
              <div class="stat">
                <jira-icon name="issues" [size]="14" />
                <span>{{ member.assignedIssues }} assignées</span>
              </div>
              <div class="stat">
                <jira-icon name="check" [size]="14" />
                <span>{{ member.completedIssues }} complétées</span>
              </div>
              <div class="stat progress">
                <jira-icon name="arrow-up" [size]="14" />
                <span>{{ member.inProgressIssues }} en cours</span>
              </div>
            </div>
          </div>

          <div *ngIf="members().length === 0" class="empty-state">
            <jira-icon name="user" [size]="48" color="var(--jira-neutral-400)" />
            <p>Aucun membre d'équipe</p>
            <span>Ajoutez des membres pour voir leur charge de travail</span>
          </div>
        </div>

        <ng-template #loadingState>
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Calcul de la charge d'équipe...</p>
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
    .team-workload-widget {
      padding: var(--spacing-lg);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-md);
      border-bottom: 2px solid var(--jira-neutral-200);
    }

    h3 {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      margin: 0;
    }

    .team-count {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      background: var(--jira-neutral-100);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
    }

    .widget-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .members-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .member-item {
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

    .member-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-sm);
    }

    .member-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 1;
      min-width: 0;
    }

    .member-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .member-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .member-email {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .workload-bar {
      width: 100%;
      height: 8px;
      background: var(--jira-neutral-200);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: var(--spacing-sm);
    }

    .workload-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;

      &.low {
        background: linear-gradient(90deg, var(--jira-success), #57D9A3);
      }

      &.medium {
        background: linear-gradient(90deg, #FFC400, #FFAB00);
      }

      &.high {
        background: linear-gradient(90deg, var(--jira-danger), #FF7452);
      }
    }

    .member-stats {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);

      &.progress {
        color: var(--jira-info);
      }
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
export class TeamWorkloadComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  members = signal<TeamMemberWorkload[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadWorkload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWorkload(): void {
    this.loading.set(true);
    this.error.set(null);

    this.analyticsService.getTeamWorkload()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Transform TeamWorkloadData to TeamMemberWorkload
          const members: TeamMemberWorkload[] = data.map(item => {
            const assignedIssues = item.openIssues + item.inProgressIssues;
            const capacity = 10; // Default capacity per sprint
            const workloadPercentage = Math.min(Math.round((assignedIssues / capacity) * 100), 100);

            return {
              userId: item.userId,
              name: item.userName,
              email: `${item.userName.toLowerCase().replace(' ', '.')}@example.com`,
              assignedIssues: assignedIssues,
              completedIssues: 0, // Not provided by API, could be calculated separately
              inProgressIssues: item.inProgressIssues,
              workloadPercentage: workloadPercentage,
              capacity: capacity
            };
          });

          this.members.set(members);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading team workload:', err);
          this.error.set('Erreur lors du chargement de la charge d\'équipe');
          this.loading.set(false);
        }
      });
  }

  getWorkloadVariant(percentage: number): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' {
    if (percentage >= 80) return 'danger';
    if (percentage >= 50) return 'warning';
    return 'success';
  }
}
