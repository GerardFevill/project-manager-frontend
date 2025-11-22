import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ThemeService } from '../../../../core/services/theme.service';

interface VelocityData {
  sprint: string;
  planned: number;
  completed: number;
}

@Component({
  selector: 'app-velocity-chart',
  standalone: true,
  imports: [CommonModule, CardComponent, BaseChartDirective],
  template: `
    <jira-card [hasHeader]="true">
      <div header class="widget-header">
        <div class="header-content">
          <h3>Sprint Velocity</h3>
          <p class="header-subtitle">Team performance over time</p>
        </div>
        <select class="period-select">
          <option>Last 6 sprints</option>
          <option>Last 12 sprints</option>
        </select>
      </div>

      <div class="chart-stats">
        <div class="stat-item">
          <span class="stat-value">{{ averageVelocity() }}</span>
          <span class="stat-label">Avg Velocity</span>
        </div>
        <div class="stat-item">
          <span class="stat-value trend-up">+{{ trend() }}%</span>
          <span class="stat-label">Trend</span>
        </div>
      </div>

      <div class="chart-container">
        <canvas baseChart
          [data]="barChartData"
          [options]="barChartOptions"
          [type]="'bar'">
        </canvas>
      </div>

      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-color planned"></span>
          <span>Planned</span>
        </div>
        <div class="legend-item">
          <span class="legend-color completed"></span>
          <span>Completed</span>
        </div>
      </div>
    </jira-card>
  `,
  styles: [`
    .widget-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--spacing-lg);
    }

    .header-content h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      margin-bottom: var(--spacing-xs);
    }

    .header-subtitle {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
    }

    .period-select {
      padding: var(--spacing-xs) var(--spacing-sm);
      border: 1px solid var(--jira-neutral-300);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-800);
      background: var(--jira-neutral-0);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--jira-brand-primary);
      }

      &:focus {
        outline: none;
        border-color: var(--jira-brand-primary);
        box-shadow: 0 0 0 1px var(--jira-brand-primary);
      }
    }

    .chart-stats {
      display: flex;
      gap: var(--spacing-2xl);
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);
      background: var(--jira-neutral-50);
      border-radius: var(--radius-md);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .stat-value {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--jira-neutral-1000);

      &.trend-up {
        color: var(--jira-success);
      }

      &.trend-down {
        color: var(--jira-danger);
      }
    }

    .stat-label {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      font-weight: var(--font-weight-medium);
    }

    .chart-container {
      height: 320px;
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      position: relative;
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: var(--spacing-2xl);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--jira-neutral-200);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-700);
      font-weight: var(--font-weight-medium);
    }

    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-sm);

      &.planned {
        background: linear-gradient(135deg, #DFE1E6 0%, #C1C7D0 100%);
      }

      &.completed {
        background: linear-gradient(135deg, #0052CC 0%, #0747A6 100%);
      }
    }
  `]
})
export class VelocityChartComponent implements OnInit {
  velocityData = signal<VelocityData[]>([
    { sprint: 'Sprint 1', planned: 45, completed: 42 },
    { sprint: 'Sprint 2', planned: 50, completed: 48 },
    { sprint: 'Sprint 3', planned: 48, completed: 52 },
    { sprint: 'Sprint 4', planned: 55, completed: 50 },
    { sprint: 'Sprint 5', planned: 52, completed: 55 },
    { sprint: 'Sprint 6', planned: 60, completed: 58 }
  ]);

  averageVelocity = signal(51);
  trend = signal(12);

  barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleColor: '#fff',
        bodyColor: '#fff',
        displayColors: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y} points`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F4F5F7'
        },
        ticks: {
          color: '#7A869A',
          font: {
            size: 11,
            family: 'Inter'
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#42526E',
          font: {
            size: 12,
            family: 'Inter'
          }
        }
      }
    }
  };

  constructor(private themeService: ThemeService) {
    // Update chart colors when theme changes
    effect(() => {
      const theme = this.themeService.currentTheme();
      this.updateChartColors();
    });
  }

  ngOnInit(): void {
    const data = this.velocityData();

    // Calculate stats
    const avgCompleted = Math.round(
      data.reduce((sum, item) => sum + item.completed, 0) / data.length
    );
    this.averageVelocity.set(avgCompleted);

    const lastThree = data.slice(-3).reduce((sum, item) => sum + item.completed, 0) / 3;
    const firstThree = data.slice(0, 3).reduce((sum, item) => sum + item.completed, 0) / 3;
    const trendValue = Math.round(((lastThree - firstThree) / firstThree) * 100);
    this.trend.set(trendValue);

    this.updateChartColors();
  }

  private updateChartColors(): void {
    const data = this.velocityData();
    const isDark = this.themeService.isDarkMode();

    // Setup chart data with theme-aware colors
    this.barChartData = {
      labels: data.map(d => d.sprint.replace('Sprint ', 'S')),
      datasets: [
        {
          label: 'Planned',
          data: data.map(d => d.planned),
          backgroundColor: isDark ? '#596773' : '#DFE1E6',
          borderColor: isDark ? '#738496' : '#C1C7D0',
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 30
        },
        {
          label: 'Completed',
          data: data.map(d => d.completed),
          backgroundColor: isDark ? '#579DFF' : '#0052CC',
          borderColor: isDark ? '#85B8FF' : '#0747A6',
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 30
        }
      ]
    };

    // Update grid colors
    if (this.barChartOptions && this.barChartOptions.scales) {
      const gridColor = isDark ? '#38414A' : '#F4F5F7';
      const tickColor = isDark ? '#9FADBC' : '#7A869A';
      const xTickColor = isDark ? '#B6C2CF' : '#42526E';

      if (this.barChartOptions.scales['y']) {
        this.barChartOptions.scales['y'].grid = { color: gridColor };
        this.barChartOptions.scales['y'].ticks = {
          color: tickColor,
          font: { size: 11, family: 'Inter' }
        };
      }

      if (this.barChartOptions.scales['x']) {
        this.barChartOptions.scales['x'].ticks = {
          color: xTickColor,
          font: { size: 12, family: 'Inter' }
        };
      }
    }
  }
}
