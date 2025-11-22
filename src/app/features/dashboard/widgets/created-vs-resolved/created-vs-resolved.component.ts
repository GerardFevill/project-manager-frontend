import { Component, OnInit, signal, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-created-vs-resolved',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="created-vs-resolved-widget">
      <div class="widget-content">
        <div *ngIf="!loading(); else loadingState" class="chart-container">
          <canvas #chartCanvas></canvas>
        </div>

        <ng-template #loadingState>
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des données...</p>
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
    .created-vs-resolved-widget {
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

    .chart-container {
      flex: 1;
      position: relative;
      min-height: 200px;

      canvas {
        max-height: 100%;
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
export class CreatedVsResolvedComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private chart?: Chart;

  loading = signal(true);
  error = signal<string | null>(null);
  chartData = signal<any>(null);

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

    this.analyticsService.getCreatedVsResolved({ period: 'month' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.chartData.set(data);
          this.loading.set(false);

          // Create chart if view is already initialized
          if (this.chartCanvas) {
            this.createChart();
          }
        },
        error: (err) => {
          console.error('Error loading created vs resolved data:', err);
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

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Issues créées',
            data: data.created,
            borderColor: '#0052CC',
            backgroundColor: 'rgba(0, 82, 204, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Issues résolues',
            data: data.resolved,
            borderColor: '#00875A',
            backgroundColor: 'rgba(0, 135, 90, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12,
                weight: 500
              }
            }
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
            bodySpacing: 6,
            usePointStyle: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              font: {
                size: 11
              }
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
