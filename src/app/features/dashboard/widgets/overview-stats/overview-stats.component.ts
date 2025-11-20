import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AnalyticsService } from '../../../../core/services/analytics.service';

interface StatCard {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: 'issues' | 'clock' | 'check' | 'warning';
  color: string;
}

@Component({
  selector: 'app-overview-stats',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="stats-grid">
      <div
        *ngFor="let stat of stats()"
        class="stat-card"
        [style.--accent-color]="stat.color"
      >
        <div class="stat-icon-wrapper">
          <div class="stat-icon" [style.background]="'linear-gradient(135deg, ' + stat.color + '15, ' + stat.color + '25)'">
            <jira-icon [name]="stat.icon" [size]="24" [color]="stat.color" />
          </div>
          <div class="pulse-ring" [style.border-color]="stat.color"></div>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-change" [class]="'trend-' + stat.trend">
            <jira-icon
              [name]="stat.trend === 'up' ? 'arrow-up' : 'arrow-down'"
              [size]="14"
            />
            <span>{{ Math.abs(stat.change) }}% vs last week</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .stat-card {
      display: flex;
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
      background: var(--jira-neutral-0);
      border-radius: var(--radius-lg);
      border: 2px solid var(--jira-neutral-200);
      position: relative;
      overflow: hidden;
    }

    .stat-icon-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-lg);
      position: relative;
      z-index: 1;
      box-shadow: var(--shadow-sm);
    }

    .pulse-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 64px;
      height: 64px;
      border: 2px solid;
      border-radius: var(--radius-lg);
      opacity: 0;
    }

    .stat-content {
      flex: 1;
      min-width: 0;
    }

    .stat-label {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      margin-bottom: var(--spacing-xs);
    }

    .stat-value {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--jira-neutral-1000);
      margin-bottom: var(--spacing-xs);
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);

      &.trend-up {
        color: var(--jira-success);
      }

      &.trend-down {
        color: var(--jira-danger);
      }

      &.trend-neutral {
        color: var(--jira-neutral-600);
      }
    }

    @media (max-width: 640px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OverviewStatsComponent implements OnInit, OnDestroy {
  Math = Math;
  private destroy$ = new Subject<void>();

  stats = signal<StatCard[]>([]);
  loading = signal(true);

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStats(): void {
    this.loading.set(true);

    this.analyticsService.getOverviewStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const statsData: StatCard[] = [
            {
              label: 'Open Issues',
              value: data.openIssues,
              change: data.openIssuesChange,
              trend: data.openIssuesChange > 0 ? 'up' : data.openIssuesChange < 0 ? 'down' : 'neutral',
              icon: 'issues',
              color: '#0052CC'
            },
            {
              label: 'In Progress',
              value: data.inProgressIssues,
              change: data.inProgressChange,
              trend: data.inProgressChange > 0 ? 'up' : data.inProgressChange < 0 ? 'down' : 'neutral',
              icon: 'clock',
              color: '#FF991F'
            },
            {
              label: 'Completed',
              value: data.completedIssues,
              change: data.completedChange,
              trend: data.completedChange > 0 ? 'up' : data.completedChange < 0 ? 'down' : 'neutral',
              icon: 'check',
              color: '#00875A'
            },
            {
              label: 'Blocked',
              value: data.blockedIssues,
              change: data.blockedChange,
              trend: data.blockedChange > 0 ? 'down' : data.blockedChange < 0 ? 'up' : 'neutral',
              icon: 'warning',
              color: '#DE350B'
            }
          ];

          this.stats.set(statsData);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          this.loading.set(false);
          // Keep empty array on error
        }
      });
  }
}
