import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ThemeService } from '../../../../core/services/theme.service';

interface BurndownData {
  day: number;
  ideal: number;
  actual: number;
}

@Component({
  selector: 'app-burndown-chart',
  standalone: true,
  imports: [CommonModule, CardComponent, IconComponent, BaseChartDirective],
  template: `
    <jira-card [hasHeader]="true">
      <div header class="widget-header">
        <div class="header-content">
          <h3>Sprint Burndown</h3>
          <p class="header-subtitle">Current sprint progress</p>
        </div>
        <div class="sprint-badge">
          <jira-icon name="sprint" [size]="14" />
          <span>Sprint 6</span>
        </div>
      </div>

      <div class="chart-stats">
        <div class="stat-card remaining">
          <div class="stat-icon">
            <jira-icon name="clock" [size]="20" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ remainingPoints() }}</span>
            <span class="stat-label">Points Remaining</span>
          </div>
        </div>
        <div class="stat-card days">
          <div class="stat-icon">
            <jira-icon name="calendar" [size]="20" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ daysLeft() }}</span>
            <span class="stat-label">Days Left</span>
          </div>
        </div>
        <div class="stat-card status" [class.on-track]="isOnTrack()" [class.behind]="!isOnTrack()">
          <div class="stat-icon">
            <jira-icon [name]="isOnTrack() ? 'check' : 'warning'" [size]="20" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ isOnTrack() ? 'On Track' : 'Behind' }}</span>
            <span class="stat-label">Status</span>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <canvas baseChart
          [data]="lineChartData"
          [options]="lineChartOptions"
          [type]="'line'">
        </canvas>
      </div>

      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-line ideal"></span>
          <span>Ideal Burndown</span>
        </div>
        <div class="legend-item">
          <span class="legend-line actual"></span>
          <span>Actual Progress</span>
        </div>
      </div>
    </jira-card>
  `,
  styles: [`
    .widget-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
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

    .sprint-badge {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--jira-info-bg);
      color: var(--jira-brand-primary);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .chart-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: var(--jira-neutral-50);
      border-radius: var(--radius-md);
      border: 2px solid transparent;
      transition: all var(--transition-normal);

      &:hover {
        background: var(--jira-neutral-0);
        border-color: var(--jira-neutral-300);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      &.on-track {
        background: var(--jira-success-bg);

        .stat-icon {
          background: var(--jira-success);
          color: white;
        }

        .stat-value {
          color: var(--jira-success);
        }
      }

      &.behind {
        background: var(--jira-warning-bg);

        .stat-icon {
          background: var(--jira-warning);
          color: white;
        }

        .stat-value {
          color: var(--jira-warning);
        }
      }
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--jira-brand-primary);
      color: white;
      border-radius: var(--radius-md);
      flex-shrink: 0;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-value {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--jira-neutral-1000);
      line-height: 1;
    }

    .stat-label {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
      font-weight: var(--font-weight-medium);
    }

    .chart-container {
      height: 280px;
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

    .legend-line {
      width: 32px;
      height: 3px;
      border-radius: 2px;

      &.ideal {
        background: #A5ADBA;
        opacity: 0.6;
      }

      &.actual {
        background: linear-gradient(90deg, #0052CC 0%, #2684FF 100%);
      }
    }
  `]
})
export class BurndownChartComponent implements OnInit {
  burndownData = signal<BurndownData[]>([
    { day: 0, ideal: 60, actual: 60 },
    { day: 1, ideal: 54, actual: 58 },
    { day: 2, ideal: 48, actual: 52 },
    { day: 3, ideal: 42, actual: 48 },
    { day: 4, ideal: 36, actual: 42 },
    { day: 5, ideal: 30, actual: 38 },
    { day: 6, ideal: 24, actual: 32 },
    { day: 7, ideal: 18, actual: 28 },
    { day: 8, ideal: 12, actual: 22 },
    { day: 9, ideal: 6, actual: 18 },
    { day: 10, ideal: 0, actual: 12 }
  ]);

  remainingPoints = signal(12);
  daysLeft = signal(4);

  lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  lineChartOptions: ChartConfiguration['options'] = {
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
          color: '#F4F5F7'
        },
        ticks: {
          color: '#42526E',
          font: {
            size: 11,
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
    const data = this.burndownData();
    const lastDay = data[data.length - 1];
    this.remainingPoints.set(lastDay.actual);

    this.updateChartColors();
  }

  isOnTrack(): boolean {
    const data = this.burndownData();
    const lastDay = data[data.length - 1];
    return lastDay.actual <= lastDay.ideal + 5;
  }

  private updateChartColors(): void {
    const data = this.burndownData();
    const isDark = this.themeService.isDarkMode();

    this.lineChartData = {
      labels: data.map(d => `Day ${d.day}`),
      datasets: [
        {
          label: 'Ideal',
          data: data.map(d => d.ideal),
          borderColor: isDark ? '#9FADBC' : '#A5ADBA',
          backgroundColor: isDark ? 'rgba(159, 173, 188, 0.1)' : 'rgba(165, 173, 186, 0.1)',
          borderWidth: 2,
          borderDash: [8, 4],
          pointRadius: 0,
          tension: 0.1
        },
        {
          label: 'Actual',
          data: data.map(d => d.actual),
          borderColor: isDark ? '#579DFF' : '#0052CC',
          backgroundColor: isDark ? 'rgba(87, 157, 255, 0.1)' : 'rgba(0, 82, 204, 0.1)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: isDark ? '#579DFF' : '#0052CC',
          pointBorderColor: isDark ? '#22272B' : '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 7,
          tension: 0.3
        }
      ]
    };

    // Update grid colors
    if (this.lineChartOptions && this.lineChartOptions.scales) {
      const gridColor = isDark ? '#38414A' : '#F4F5F7';
      const tickColor = isDark ? '#9FADBC' : '#7A869A';
      const xTickColor = isDark ? '#B6C2CF' : '#42526E';

      if (this.lineChartOptions.scales['y']) {
        this.lineChartOptions.scales['y'].grid = { color: gridColor };
        this.lineChartOptions.scales['y'].ticks = {
          color: tickColor,
          font: { size: 11, family: 'Inter' }
        };
      }

      if (this.lineChartOptions.scales['x']) {
        this.lineChartOptions.scales['x'].grid = { color: gridColor };
        this.lineChartOptions.scales['x'].ticks = {
          color: xTickColor,
          font: { size: 11, family: 'Inter' }
        };
      }
    }
  }
}
