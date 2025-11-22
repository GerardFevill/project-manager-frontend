import { Component, OnInit, signal, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-cumulative-flow',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="cumulative-flow-widget">
      <div class="widget-content">
        <div *ngIf="!loading(); else loadingState" class="chart-container">
          <canvas #chartCanvas></canvas>
        </div>

        <ng-template #loadingState>
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement du diagramme...</p>
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
    .cumulative-flow-widget {
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
export class CumulativeFlowComponent implements OnInit, OnDestroy, AfterViewInit {
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

    this.analyticsService.getCumulativeFlowData({ period: 'month' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.chartData.set(data);
          this.loading.set(false);

          if (this.chartCanvas) {
            this.createChart();
          }
        },
        error: (err) => {
          console.error('Error loading cumulative flow data:', err);
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

    // Status colors
    const statusColors: Record<string, string> = {
      'todo': '#DFE1E6',
      'in-progress': '#0052CC',
      'review': '#FFC400',
      'done': '#00875A'
    };

    const datasets = data.series.map((series: any) => ({
      label: series.name,
      data: series.data,
      backgroundColor: statusColors[series.status] || '#DFE1E6',
      borderColor: 'transparent',
      fill: true
    }));

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: datasets
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
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 12,
              font: {
                size: 11,
                weight: 500
              }
            }
          },
          tooltip: {
            mode: 'index',
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
            stacked: true,
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
            stacked: true,
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
