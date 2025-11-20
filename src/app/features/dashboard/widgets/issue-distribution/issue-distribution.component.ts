import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ThemeService } from '../../../../core/services/theme.service';

interface DistributionData {
  label: string;
  value: number;
  color: string;
  gradient: string[];
}

@Component({
  selector: 'app-issue-distribution',
  standalone: true,
  imports: [CommonModule, CardComponent, BaseChartDirective],
  template: `
    <jira-card [hasHeader]="true">
      <div header class="widget-header">
        <h3>Issue Distribution</h3>
        <select class="group-select" (change)="onGroupChange($event)">
          <option value="status">By Status</option>
          <option value="priority">By Priority</option>
          <option value="type">By Type</option>
        </select>
      </div>

      <div class="chart-container">
        <canvas baseChart
          [data]="doughnutChartData"
          [options]="doughnutChartOptions"
          [type]="'doughnut'">
        </canvas>
        <div class="chart-center-text">
          <div class="total-count">{{ totalIssues() }}</div>
          <div class="total-label">Total</div>
        </div>
      </div>

      <div class="distribution-list">
        <div
          *ngFor="let item of distributionData()"
          class="distribution-item"
          (mouseenter)="hoveredItem.set(item.label)"
          (mouseleave)="hoveredItem.set(null)"
          [class.hovered]="hoveredItem() === item.label"
        >
          <div class="item-left">
            <span class="item-color" [style.background]="'linear-gradient(135deg, ' + item.gradient[0] + ', ' + item.gradient[1] + ')'"></span>
            <span class="item-label">{{ item.label }}</span>
          </div>
          <div class="item-right">
            <div class="progress-bar">
              <div
                class="progress-fill"
                [style.width.%]="getPercentage(item.value)"
                [style.background]="'linear-gradient(90deg, ' + item.gradient[0] + ', ' + item.gradient[1] + ')'"
              ></div>
            </div>
            <span class="item-value">{{ item.value }}</span>
            <span class="item-percent">{{ getPercentage(item.value) }}%</span>
          </div>
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

    .group-select {
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

    .chart-container {
      position: relative;
      height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--spacing-xl);
    }

    .chart-center-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
    }

    .total-count {
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-bold);
      color: var(--jira-neutral-1000);
      line-height: 1;
      margin-bottom: var(--spacing-xs);
    }

    .total-label {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .distribution-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .distribution-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      transition: all var(--transition-normal);
      cursor: pointer;

      &:hover, &.hovered {
        background: var(--jira-neutral-50);
        transform: translateX(4px);
      }
    }

    .item-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex: 1;
    }

    .item-color {
      width: 16px;
      height: 16px;
      border-radius: var(--radius-sm);
      flex-shrink: 0;
      box-shadow: var(--shadow-sm);
    }

    .item-label {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-800);
      font-weight: var(--font-weight-medium);
    }

    .item-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .progress-bar {
      width: 80px;
      height: 6px;
      background: var(--jira-neutral-200);
      border-radius: 3px;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 8px rgba(0, 82, 204, 0.3);
    }

    .item-value {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-bold);
      color: var(--jira-neutral-1000);
      min-width: 35px;
      text-align: right;
    }

    .item-percent {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      min-width: 45px;
      text-align: right;
      font-weight: var(--font-weight-medium);
    }
  `]
})
export class IssueDistributionComponent implements OnInit {
  distributionData = signal<DistributionData[]>([
    {
      label: 'To Do',
      value: 45,
      color: '#DFE1E6',
      gradient: ['#E8E9ED', '#C1C7D0']
    },
    {
      label: 'In Progress',
      value: 38,
      color: '#0052CC',
      gradient: ['#0052CC', '#2684FF']
    },
    {
      label: 'In Review',
      value: 22,
      color: '#6554C0',
      gradient: ['#6554C0', '#8777D9']
    },
    {
      label: 'Done',
      value: 87,
      color: '#00875A',
      gradient: ['#00875A', '#36B37E']
    }
  ]);

  totalIssues = signal(192);
  hoveredItem = signal<string | null>(null);

  doughnutChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  doughnutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
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
          label: (context: any) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: any) => a + Number(b), 0) as number;
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${value} (${percentage}%)`;
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
    const total = this.distributionData().reduce((sum, item) => sum + item.value, 0);
    this.totalIssues.set(total);

    this.updateChartColors();
  }

  getPercentage(value: number): number {
    return Math.round((value / this.totalIssues()) * 100);
  }

  onGroupChange(event: Event): void {
    console.log('Group changed:', (event.target as HTMLSelectElement).value);
    // TODO: Update data based on selection
  }

  private updateChartColors(): void {
    const data = this.distributionData();
    const isDark = this.themeService.isDarkMode();

    this.doughnutChartData = {
      labels: data.map(d => d.label),
      datasets: [
        {
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.gradient[0]),
          borderColor: isDark ? '#22272B' : '#fff',
          borderWidth: 3,
          hoverBorderWidth: 4,
          hoverOffset: 8,
          spacing: 2
        }
      ]
    };
  }
}
