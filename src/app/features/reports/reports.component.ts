import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ExportService } from '../../core/services/export.service';

// Import widgets
import { VelocityChartComponent } from '../dashboard/widgets/velocity-chart/velocity-chart.component';
import { BurndownChartComponent } from '../dashboard/widgets/burndown-chart/burndown-chart.component';
import { CumulativeFlowComponent } from '../dashboard/widgets/cumulative-flow/cumulative-flow.component';
import { IssueDistributionComponent } from '../dashboard/widgets/issue-distribution/issue-distribution.component';
import { ResolutionTimeComponent } from '../dashboard/widgets/resolution-time/resolution-time.component';
import { CreatedVsResolvedComponent } from '../dashboard/widgets/created-vs-resolved/created-vs-resolved.component';
import { TeamWorkloadComponent } from '../dashboard/widgets/team-workload/team-workload.component';
import { EpicProgressComponent } from '../dashboard/widgets/epic-progress/epic-progress.component';

type ReportCategory = 'sprint' | 'team' | 'issues' | 'all';

interface ReportWidget {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  component: any;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    VelocityChartComponent,
    BurndownChartComponent,
    CumulativeFlowComponent,
    IssueDistributionComponent,
    ResolutionTimeComponent,
    CreatedVsResolvedComponent,
    TeamWorkloadComponent,
    EpicProgressComponent
  ],
  template: `
    <div class="reports-page">
      <!-- Header -->
      <div class="reports-header">
        <div class="header-title">
          <h1>Reports & Analytics</h1>
          <p class="subtitle">View project insights and export reports</p>
        </div>

        <div class="header-actions">
          <jira-button
            variant="subtle"
            size="medium"
            (clicked)="exportAllReports()"
          >
            <jira-icon leftIcon name="arrow-down" [size]="16" />
            Export All
          </jira-button>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="category-filter">
        <button
          *ngFor="let cat of categories"
          class="category-btn"
          [class.active]="selectedCategory() === cat.id"
          (click)="selectCategory(cat.id)"
        >
          <jira-icon [name]="cat.icon" [size]="16" />
          {{ cat.label }}
        </button>
      </div>

      <!-- Reports Grid -->
      <div class="reports-grid">
        <div
          *ngFor="let widget of filteredWidgets()"
          class="report-card"
          [id]="'report-card-' + widget.id"
        >
          <div class="report-header">
            <h3>{{ widget.title }}</h3>
            <div class="export-dropdown">
              <button
                class="export-btn"
                (click)="toggleExportMenu(widget.id)"
                title="Export"
              >
                <jira-icon name="arrow-down" [size]="14" />
              </button>

              <div
                *ngIf="showExportMenu() === widget.id"
                class="export-menu"
              >
                <button (click)="exportReportAs(widget, 'png')">
                  Export as PNG
                </button>
                <button (click)="exportReportAs(widget, 'pdf')">
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
          <p class="report-description">{{ widget.description }}</p>

          <!-- Widget Component -->
          <div class="widget-container" [id]="'widget-' + widget.id">
            <ng-container [ngSwitch]="widget.id">
              <app-velocity-chart *ngSwitchCase="'velocity'" />
              <app-burndown-chart *ngSwitchCase="'burndown'" />
              <app-cumulative-flow *ngSwitchCase="'cumulative-flow'" />
              <app-issue-distribution *ngSwitchCase="'issue-distribution'" />
              <app-resolution-time *ngSwitchCase="'resolution-time'" />
              <app-created-vs-resolved *ngSwitchCase="'created-vs-resolved'" />
              <app-team-workload *ngSwitchCase="'team-workload'" />
              <app-epic-progress *ngSwitchCase="'epic-progress'" />
            </ng-container>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredWidgets().length === 0" class="empty-state">
        <jira-icon name="reports" [size]="64" color="var(--jira-neutral-400)" />
        <h2>No reports in this category</h2>
        <p>Try selecting a different category</p>
      </div>
    </div>
  `,
  styles: [`
    .reports-page {
      padding: var(--spacing-xl);
      max-width: 1600px;
      margin: 0 auto;
    }

    .reports-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--spacing-xl);
      gap: var(--spacing-xl);

      @media (max-width: 768px) {
        flex-direction: column;
      }
    }

    .header-title {
      h1 {
        margin: 0 0 var(--spacing-xs) 0;
        color: var(--jira-neutral-1000);
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-semibold);
      }
    }

    .subtitle {
      color: var(--jira-neutral-600);
      font-size: var(--font-size-md);
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .category-filter {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-2xl);
      flex-wrap: wrap;
    }

    .category-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--jira-neutral-300);
      background: var(--jira-neutral-0);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--jira-neutral-700);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--jira-brand-primary);
        background: var(--jira-neutral-50);
      }

      &.active {
        border-color: var(--jira-brand-primary);
        background: var(--jira-brand-primary);
        color: white;
      }
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
      gap: var(--spacing-xl);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .report-card {
      background: var(--jira-neutral-0);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      transition: box-shadow var(--transition-fast);

      &:hover {
        box-shadow: var(--shadow-lg);
      }
    }

    .report-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-sm);

      h3 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--jira-neutral-1000);
        margin: 0;
      }
    }

    .export-dropdown {
      position: relative;
    }

    .export-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-700);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-200);
        color: var(--jira-neutral-1000);
      }
    }

    .export-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: var(--spacing-xs);
      background: var(--jira-neutral-0);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      min-width: 180px;
      z-index: 100;
      overflow: hidden;

      button {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        width: 100%;
        padding: var(--spacing-sm) var(--spacing-md);
        border: none;
        background: transparent;
        color: var(--jira-neutral-1000);
        font-size: var(--font-size-sm);
        text-align: left;
        cursor: pointer;
        transition: background var(--transition-fast);

        &:hover {
          background: var(--jira-neutral-100);
        }

        &:not(:last-child) {
          border-bottom: 1px solid var(--jira-neutral-200);
        }
      }
    }

    .report-description {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      margin: 0 0 var(--spacing-md) 0;
    }

    .widget-container {
      min-height: 300px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;
      gap: var(--spacing-md);

      h2 {
        font-size: var(--font-size-2xl);
        color: var(--jira-neutral-800);
        margin: 0;
      }

      p {
        color: var(--jira-neutral-600);
        font-size: var(--font-size-md);
        margin: 0;
      }
    }
  `]
})
export class ReportsComponent {
  selectedCategory = signal<ReportCategory>('all');
  showExportMenu = signal<string | null>(null);
  exporting = signal(false);

  categories = [
    { id: 'all' as ReportCategory, label: 'All Reports', icon: 'dashboard' as const },
    { id: 'sprint' as ReportCategory, label: 'Sprint Reports', icon: 'sprint' as const },
    { id: 'team' as ReportCategory, label: 'Team Reports', icon: 'user' as const },
    { id: 'issues' as ReportCategory, label: 'Issue Reports', icon: 'issues' as const }
  ];

  constructor(private exportService: ExportService) {
    // Close export menu when clicking outside
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.export-dropdown')) {
          this.showExportMenu.set(null);
        }
      });
    }
  }

  widgets: ReportWidget[] = [
    {
      id: 'velocity',
      title: 'Velocity Chart',
      description: 'Track team velocity across sprints',
      category: 'sprint',
      component: VelocityChartComponent
    },
    {
      id: 'burndown',
      title: 'Burndown Chart',
      description: 'Monitor sprint progress and remaining work',
      category: 'sprint',
      component: BurndownChartComponent
    },
    {
      id: 'cumulative-flow',
      title: 'Cumulative Flow Diagram',
      description: 'Visualize work flow and bottlenecks',
      category: 'sprint',
      component: CumulativeFlowComponent
    },
    {
      id: 'team-workload',
      title: 'Team Workload',
      description: 'View team member capacity and assignments',
      category: 'team',
      component: TeamWorkloadComponent
    },
    {
      id: 'issue-distribution',
      title: 'Issue Distribution',
      description: 'Analyze issues by type and status',
      category: 'issues',
      component: IssueDistributionComponent
    },
    {
      id: 'resolution-time',
      title: 'Resolution Time',
      description: 'Average time to resolve issues',
      category: 'issues',
      component: ResolutionTimeComponent
    },
    {
      id: 'created-vs-resolved',
      title: 'Created vs Resolved',
      description: 'Compare created and resolved issues over time',
      category: 'issues',
      component: CreatedVsResolvedComponent
    },
    {
      id: 'epic-progress',
      title: 'Epic Progress',
      description: 'Track progress of epics',
      category: 'issues',
      component: EpicProgressComponent
    }
  ];

  filteredWidgets = signal<ReportWidget[]>(this.widgets);

  selectCategory(category: ReportCategory): void {
    this.selectedCategory.set(category);

    if (category === 'all') {
      this.filteredWidgets.set(this.widgets);
    } else {
      this.filteredWidgets.set(this.widgets.filter(w => w.category === category));
    }
  }

  toggleExportMenu(widgetId: string): void {
    const currentId = this.showExportMenu();
    this.showExportMenu.set(currentId === widgetId ? null : widgetId);
  }

  async exportReportAs(widget: ReportWidget, format: 'png' | 'pdf'): Promise<void> {
    this.showExportMenu.set(null);

    try {
      this.exporting.set(true);

      // Get the report card element
      const element = document.getElementById(`report-card-${widget.id}`);
      if (!element) {
        console.error('Report element not found');
        return;
      }

      const filename = widget.title.toLowerCase().replace(/\s+/g, '-');

      if (format === 'png') {
        await this.exportService.exportAsImage(element, filename);
      } else if (format === 'pdf') {
        await this.exportService.exportAsPDF(element, filename);
      }

      console.log(`Exported ${widget.title} as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      this.exporting.set(false);
    }
  }

  async exportAllReports(): Promise<void> {
    try {
      this.exporting.set(true);

      const filteredWidgets = this.filteredWidgets();
      const elements: HTMLElement[] = [];

      // Collect all report card elements
      for (const widget of filteredWidgets) {
        const element = document.getElementById(`report-card-${widget.id}`);
        if (element) {
          elements.push(element);
        }
      }

      if (elements.length === 0) {
        alert('No reports to export');
        return;
      }

      const categoryLabel = this.selectedCategory() === 'all'
        ? 'all-reports'
        : `${this.selectedCategory()}-reports`;

      await this.exportService.exportMultipleAsPDF(elements, categoryLabel);

      console.log(`Exported ${elements.length} reports as PDF`);
    } catch (error) {
      console.error('Export all failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      this.exporting.set(false);
    }
  }
}
