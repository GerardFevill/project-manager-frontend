import { Component, OnInit, signal, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-resolution-time',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="resolution-time-widget">
      <div class="widget-header">
        <h3>Temps de résolution moyen</h3>
        <div class="time-unit">
          <jira-icon name="calendar" [size]="16" />
          <span>jours</span>
        </div>
      </div>

      <div class="widget-content">
        <div *ngIf="!loading(); else loadingState">
          <div class="chart-container">
            <canvas #chartCanvas></canvas>
          </div>

          <div class="stats-summary">
            <div class="summary-item">
              <span class="summary-label">Plus rapide</span>
              <span class="summary-value fastest">{{ fastest() }}j</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Moyenne</span>
              <span class="summary-value average">{{ average() }}j</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Plus lent</span>
              <span class="summary-value slowest">{{ slowest() }}j</span>
            </div>
          </div>
        </div>

        <ng-template #loadingState>
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Calcul des temps de résolution...</p>
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
    .resolution-time-widget {
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

    .time-unit {
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

    .chart-container {
      flex: 1;
      position: relative;
      min-height: 200px;
      margin-bottom: var(--spacing-lg);

      canvas {
        max-height: 100%;
      }
    }

    .stats-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--jira-neutral-50);
      border-radius: var(--radius-md);
      border: 1px solid var(--jira-neutral-200);
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .summary-label {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-value {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);

      &.fastest {
        color: var(--jira-success);
      }

      &.average {
        color: var(--jira-brand-primary);
      }

      &.slowest {
        color: var(--jira-danger);
      }
    }

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
export class ResolutionTimeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private chart?: Chart;

  loading = signal(true);
  error = signal<string | null>(null);
  chartData = signal<any>(null);

  fastest = signal(0);
  average = signal(0);
  slowest = signal(0);

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (this.chartData()) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.analyticsService.getResolutionTime()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Transform data array to chart format
          const labels = data.map(item => item.issueType);
          const avgDays = data.map(item => Math.round(item.averageTime / 24)); // Convert hours to days

          const chartData = { labels, avgDays };
          this.chartData.set(chartData);

          // Calculate summary stats
          if (avgDays && avgDays.length > 0) {
            this.fastest.set(Math.min(...avgDays));
            this.average.set(Math.round(avgDays.reduce((a: number, b: number) => a + b, 0) / avgDays.length));
            this.slowest.set(Math.max(...avgDays));
          }

          this.loading.set(false);

          if (this.chartCanvas) {
            this.createChart();
          }
        },
        error: (err) => {
          console.error('Error loading resolution time data:', err);
          this.error.set('Erreur lors du chargement des données');
          this.loading.set(false);
        }
      });
  }

  private createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const data = this.chartData();
    if (!data || !this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Colors for different categories
    const colors = data.labels.map((label: string, index: number) => {
      const colorMap: Record<string, string> = {
        'Story': '#00875A',
        'Task': '#0052CC',
        'Bug': '#DE350B',
        'Epic': '#6554C0',
        'Lowest': '#DFE1E6',
        'Low': '#B3D4FF',
        'Medium': '#FFC400',
        'High': '#FF991F',
        'Highest': '#DE350B'
      };
      return colorMap[label] || '#0052CC';
    });

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Temps moyen (jours)',
          data: data.avgDays,
          backgroundColor: colors,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(9, 30, 66, 0.95)',
            padding: 12,
            titleFont: {
              size: 13,
              weight: 600
            },
            bodyFont: {
              size: 12
            },
            callbacks: {
              label: (context) => {
                return `${context.parsed.y} jours en moyenne`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              font: {
                size: 11
              },
              callback: (value) => `${value}j`
            },
            grid: {
              color: 'rgba(9, 30, 66, 0.08)'
            }
          },
          x: {
            ticks: {
              font: {
                size: 11
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }
}
