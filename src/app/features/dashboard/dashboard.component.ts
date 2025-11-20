import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { WidgetContainerComponent } from '../../shared/components/widget-container/widget-container.component';
import { WidgetCatalogComponent } from './widget-catalog/widget-catalog.component';
import { DashboardManagerComponent } from './dashboard-manager/dashboard-manager.component';
import { FilterManagerComponent } from './filter-manager/filter-manager.component';
import { WidgetSettingsDialogComponent } from '../../shared/components/widget-settings-dialog/widget-settings-dialog.component';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FilterService } from '../../core/services/filter.service';

// Import all widget components
import { OverviewStatsComponent } from './widgets/overview-stats/overview-stats.component';
import { MyIssuesComponent } from './widgets/my-issues/my-issues.component';
import { RecentActivityComponent } from './widgets/recent-activity/recent-activity.component';
import { VelocityChartComponent } from './widgets/velocity-chart/velocity-chart.component';
import { BurndownChartComponent } from './widgets/burndown-chart/burndown-chart.component';
import { IssueDistributionComponent } from './widgets/issue-distribution/issue-distribution.component';
import { FilterResultsComponent } from './widgets/filter-results/filter-results.component';
import { CreatedVsResolvedComponent } from './widgets/created-vs-resolved/created-vs-resolved.component';
import { CumulativeFlowComponent } from './widgets/cumulative-flow/cumulative-flow.component';
import { EpicProgressComponent } from './widgets/epic-progress/epic-progress.component';
import { ResolutionTimeComponent } from './widgets/resolution-time/resolution-time.component';
import { TeamWorkloadComponent } from './widgets/team-workload/team-workload.component';

import { DashboardLayoutService, WidgetType, WidgetConfig } from '../../core/services/dashboard-layout.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    WidgetContainerComponent,
    WidgetCatalogComponent,
    DashboardManagerComponent,
    FilterManagerComponent,
    WidgetSettingsDialogComponent,
    OverviewStatsComponent,
    MyIssuesComponent,
    RecentActivityComponent,
    VelocityChartComponent,
    BurndownChartComponent,
    IssueDistributionComponent,
    FilterResultsComponent,
    CreatedVsResolvedComponent,
    CumulativeFlowComponent,
    EpicProgressComponent,
    ResolutionTimeComponent,
    TeamWorkloadComponent,
    DragDropModule
  ],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>{{ currentDashboard()?.name || 'Dashboard' }}</h1>
          <p class="dashboard-subtitle">{{ currentDashboard()?.description || "Welcome back! Here's what's happening with your projects." }}</p>
        </div>
        <div class="header-actions">
          <jira-button
            variant="subtle"
            size="medium"
            (clicked)="showManager.set(true)"
          >
            <jira-icon leftIcon name="settings" [size]="16" />
            Manage
          </jira-button>

          <jira-button
            [variant]="isEditMode() ? 'primary' : 'subtle'"
            size="medium"
            (clicked)="toggleEditMode()"
          >
            <jira-icon leftIcon [name]="isEditMode() ? 'check' : 'edit'" [size]="16" />
            {{ isEditMode() ? 'Done' : 'Edit' }}
          </jira-button>

          <jira-button
            *ngIf="isEditMode()"
            variant="primary"
            size="medium"
            (clicked)="showCatalog.set(true)"
          >
            <jira-icon leftIcon name="plus" [size]="16" />
            Add Widget
          </jira-button>

          <jira-button
            [variant]="filterService.activeFilter() ? 'primary' : 'subtle'"
            size="medium"
            (clicked)="showFilters.set(true)"
          >
            <jira-icon leftIcon name="filter" [size]="16" />
            {{ filterService.activeFilter() ? filterService.activeFilter()!.name : 'Filter' }}
          </jira-button>
          <jira-button variant="subtle" size="medium">
            <jira-icon leftIcon name="calendar" [size]="16" />
            Last 30 days
          </jira-button>
        </div>
      </div>

      <!-- Widgets Grid -->
      <div
        class="widgets-grid"
        [class.edit-mode]="isEditMode()"
        cdkDropList
        (cdkDropListDropped)="onDrop($event)"
      >
        <app-widget-container
          *ngFor="let widget of widgets()"
          [widget]="widget"
          [editMode]="isEditMode()"
          (remove)="removeWidget(widget.id)"
          (settings)="openWidgetSettings(widget)"
          (refresh)="refreshWidget(widget.id)"
          cdkDrag
          [cdkDragDisabled]="!isEditMode()"
        >
          <!-- Render widget based on type -->
          <app-overview-stats *ngIf="widget.type === 'overview-stats'" />
          <app-my-issues *ngIf="widget.type === 'my-issues'" />
          <app-recent-activity *ngIf="widget.type === 'recent-activity'" />
          <app-velocity-chart *ngIf="widget.type === 'velocity-chart'" />
          <app-burndown-chart *ngIf="widget.type === 'burndown-chart'" />
          <app-issue-distribution *ngIf="widget.type === 'issue-distribution'" />
          <app-filter-results *ngIf="widget.type === 'filter-results'" />
          <app-created-vs-resolved *ngIf="widget.type === 'created-vs-resolved'" />
          <app-cumulative-flow *ngIf="widget.type === 'cumulative-flow'" />
          <app-epic-progress *ngIf="widget.type === 'epic-progress'" />
          <app-resolution-time *ngIf="widget.type === 'resolution-time'" />
          <app-team-workload *ngIf="widget.type === 'team-workload'" />

          <!-- Placeholder for widgets not yet implemented -->
          <div *ngIf="!isWidgetImplemented(widget.type)" class="widget-placeholder">
            <jira-icon name="info" [size]="48" color="var(--jira-neutral-400)" />
            <p>{{ widget.title }}</p>
            <span class="placeholder-text">Widget coming soon...</span>
          </div>
        </app-widget-container>
      </div>

      <!-- Empty state -->
      <div *ngIf="widgets().length === 0" class="empty-state">
        <jira-icon name="dashboard" [size]="64" color="var(--jira-neutral-400)" />
        <h2>No widgets added yet</h2>
        <p>Click "Add Widget" to customize your dashboard</p>
        <jira-button variant="primary" size="large" (clicked)="showCatalog.set(true)">
          <jira-icon leftIcon name="plus" [size]="16" />
          Add Widget
        </jira-button>
      </div>

      <!-- Widget Catalog Modal -->
      <app-widget-catalog
        *ngIf="showCatalog()"
        (close)="showCatalog.set(false)"
        (addWidget)="addWidget($event)"
      />

      <!-- Dashboard Manager Modal -->
      <app-dashboard-manager
        *ngIf="showManager()"
        (close)="showManager.set(false)"
      />

      <!-- Filter Manager Modal -->
      <app-filter-manager
        *ngIf="showFilters()"
        (close)="showFilters.set(false)"
      />

      <!-- Widget Settings Dialog -->
      <app-widget-settings-dialog
        *ngIf="settingsWidget()"
        [widget]="settingsWidget()!"
        (close)="settingsWidget.set(null)"
        (save)="saveWidgetSettings($event)"
      />
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1600px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--spacing-2xl);
      gap: var(--spacing-xl);

      @media (max-width: 768px) {
        flex-direction: column;
      }
    }

    h1 {
      margin-bottom: var(--spacing-xs);
      color: var(--jira-neutral-1000);
    }

    .dashboard-subtitle {
      color: var(--jira-neutral-600);
      font-size: var(--font-size-md);
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;

      @media (max-width: 640px) {
        width: 100%;
      }
    }

    .widgets-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: var(--spacing-xl);
      grid-auto-rows: minmax(100px, auto);

      @media (max-width: 1200px) {
        grid-template-columns: repeat(6, 1fr);
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      &.edit-mode {
        app-widget-container {
          cursor: move;
        }
      }
    }

    app-widget-container {
      /* Dynamic grid placement based on widget size */
      &:nth-child(1) { grid-column: span 12; grid-row: span 2; }
      &:nth-child(2) { grid-column: span 6; grid-row: span 4; }
      &:nth-child(3) { grid-column: span 6; grid-row: span 4; }
      &:nth-child(4) { grid-column: span 6; grid-row: span 5; }
      &:nth-child(5) { grid-column: span 6; grid-row: span 5; }
      &:nth-child(6) { grid-column: span 6; grid-row: span 5; }

      @media (max-width: 1200px) {
        &:nth-child(n) {
          grid-column: span 6 !important;
        }
      }

      @media (max-width: 768px) {
        &:nth-child(n) {
          grid-column: 1 / -1 !important;
          grid-row: auto !important;
        }
      }
    }

    .widget-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;
      min-height: 200px;

      p {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--jira-neutral-800);
        margin: var(--spacing-lg) 0 var(--spacing-xs) 0;
      }

      .placeholder-text {
        color: var(--jira-neutral-600);
        font-size: var(--font-size-sm);
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;
      min-height: 400px;

      h2 {
        font-size: var(--font-size-2xl);
        color: var(--jira-neutral-800);
        margin: var(--spacing-lg) 0 var(--spacing-sm) 0;
      }

      p {
        color: var(--jira-neutral-600);
        margin-bottom: var(--spacing-xl);
      }
    }

    /* Drag & Drop Styles */
    .cdk-drag-preview {
      box-shadow: var(--shadow-xl);
      opacity: 0.9;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
      background: var(--jira-neutral-100);
      border: 2px dashed var(--jira-brand-primary);
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .widgets-grid.cdk-drop-list-dragging app-widget-container:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class DashboardComponent implements OnInit {
  showCatalog = signal(false);
  showManager = signal(false);
  showFilters = signal(false);
  settingsWidget = signal<WidgetConfig | null>(null);

  constructor(
    public layoutService: DashboardLayoutService,
    public filterService: FilterService
  ) {}

  ngOnInit(): void {
    console.log('Dashboard loaded');
  }

  get currentDashboard() {
    return this.layoutService.currentDashboard;
  }

  get widgets() {
    return signal(this.currentDashboard()?.layout.widgets || []);
  }

  get isEditMode() {
    return this.layoutService.isEditMode;
  }

  toggleEditMode(): void {
    this.layoutService.toggleEditMode();
  }

  addWidget(widgetType: WidgetType): void {
    this.layoutService.addWidget(widgetType);
  }

  removeWidget(widgetId: string): void {
    this.layoutService.removeWidget(widgetId);
  }

  openWidgetSettings(widget: WidgetConfig): void {
    this.settingsWidget.set(widget);
  }

  saveWidgetSettings(settings: any): void {
    const widget = this.settingsWidget();
    if (!widget) return;

    // Update widget with new settings
    this.layoutService.updateWidget(widget.id, {
      title: settings.title,
      settings: settings
    });
  }

  refreshWidget(widgetId: string): void {
    console.log('Refresh widget', widgetId);
    // TODO: Implement widget refresh
  }

  isWidgetImplemented(type: WidgetType): boolean {
    const implemented: WidgetType[] = [
      'overview-stats',
      'my-issues',
      'recent-activity',
      'velocity-chart',
      'burndown-chart',
      'issue-distribution',
      'filter-results',
      'created-vs-resolved',
      'cumulative-flow',
      'epic-progress',
      'resolution-time',
      'team-workload'
    ];
    return implemented.includes(type);
  }

  onDrop(event: CdkDragDrop<WidgetConfig[]>): void {
    const current = this.currentDashboard();
    if (!current) return;

    // Reorder the widgets array
    moveItemInArray(current.layout.widgets, event.previousIndex, event.currentIndex);

    // Update the dashboard
    this.layoutService.updateDashboard(current.id, {
      layout: current.layout
    });
  }
}
