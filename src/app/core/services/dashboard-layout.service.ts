import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IconName } from '../../shared/components/icon/icon.component';

export type WidgetType =
  | 'overview-stats'
  | 'my-issues'
  | 'recent-activity'
  | 'velocity-chart'
  | 'burndown-chart'
  | 'issue-distribution'
  | 'filter-results'
  | 'created-vs-resolved'
  | 'cumulative-flow'
  | 'epic-progress'
  | 'resolution-time'
  | 'team-workload';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  position: { row: number; col: number };
  size: { width: number; height: number }; // Grid units
  settings: Record<string, any>;
  filters?: Record<string, any>;
}

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  layout: {
    columns: 1 | 2 | 3;
    widgets: WidgetConfig[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  icon: IconName;
  category: 'charts' | 'lists' | 'stats' | 'activity';
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
  configurable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardLayoutService {
  private readonly STORAGE_KEY = 'jira-dashboards';
  private readonly CURRENT_DASHBOARD_KEY = 'jira-current-dashboard';

  // Available widget definitions
  readonly widgetDefinitions: WidgetDefinition[] = [
    {
      type: 'overview-stats',
      name: 'Overview Stats',
      description: 'Quick stats with issue counts and trends',
      icon: 'dashboard',
      category: 'stats',
      defaultSize: { width: 12, height: 2 },
      minSize: { width: 6, height: 2 },
      maxSize: { width: 12, height: 3 },
      configurable: true
    },
    {
      type: 'my-issues',
      name: 'My Issues',
      description: 'Issues assigned to you',
      icon: 'issues',
      category: 'lists',
      defaultSize: { width: 6, height: 4 },
      minSize: { width: 4, height: 3 },
      maxSize: { width: 12, height: 8 },
      configurable: true
    },
    {
      type: 'recent-activity',
      name: 'Recent Activity',
      description: 'Latest activity stream',
      icon: 'clock',
      category: 'activity',
      defaultSize: { width: 6, height: 4 },
      minSize: { width: 4, height: 3 },
      maxSize: { width: 12, height: 8 },
      configurable: true
    },
    {
      type: 'velocity-chart',
      name: 'Sprint Velocity',
      description: 'Team performance over sprints',
      icon: 'reports',
      category: 'charts',
      defaultSize: { width: 6, height: 5 },
      minSize: { width: 4, height: 4 },
      maxSize: { width: 12, height: 8 },
      configurable: true
    },
    {
      type: 'burndown-chart',
      name: 'Sprint Burndown',
      description: 'Current sprint progress',
      icon: 'sprint',
      category: 'charts',
      defaultSize: { width: 6, height: 5 },
      minSize: { width: 4, height: 4 },
      maxSize: { width: 12, height: 8 },
      configurable: true
    },
    {
      type: 'issue-distribution',
      name: 'Issue Distribution',
      description: 'Issues grouped by status, priority, or type',
      icon: 'reports',
      category: 'charts',
      defaultSize: { width: 6, height: 5 },
      minSize: { width: 4, height: 4 },
      maxSize: { width: 12, height: 8 },
      configurable: true
    },
    {
      type: 'filter-results',
      name: 'Filter Results',
      description: 'Display issues from a custom JQL query',
      icon: 'filter',
      category: 'lists',
      defaultSize: { width: 12, height: 6 },
      minSize: { width: 6, height: 4 },
      maxSize: { width: 12, height: 10 },
      configurable: true
    },
    {
      type: 'created-vs-resolved',
      name: 'Created vs Resolved',
      description: 'Compare issue creation and resolution trends',
      icon: 'reports',
      category: 'charts',
      defaultSize: { width: 6, height: 4 },
      minSize: { width: 4, height: 3 },
      maxSize: { width: 12, height: 6 },
      configurable: true
    },
    {
      type: 'cumulative-flow',
      name: 'Cumulative Flow Diagram',
      description: 'Visualize workflow and bottlenecks',
      icon: 'reports',
      category: 'charts',
      defaultSize: { width: 12, height: 5 },
      minSize: { width: 6, height: 4 },
      maxSize: { width: 12, height: 8 },
      configurable: true
    },
    {
      type: 'epic-progress',
      name: 'Epic Progress',
      description: 'Track epic completion status',
      icon: 'issues',
      category: 'stats',
      defaultSize: { width: 6, height: 4 },
      minSize: { width: 4, height: 3 },
      maxSize: { width: 12, height: 6 },
      configurable: true
    },
    {
      type: 'resolution-time',
      name: 'Resolution Time',
      description: 'Average time to resolve issues',
      icon: 'clock',
      category: 'stats',
      defaultSize: { width: 6, height: 4 },
      minSize: { width: 4, height: 3 },
      maxSize: { width: 12, height: 6 },
      configurable: true
    },
    {
      type: 'team-workload',
      name: 'Team Workload',
      description: 'Issue distribution across team members',
      icon: 'user',
      category: 'stats',
      defaultSize: { width: 6, height: 4 },
      minSize: { width: 4, height: 3 },
      maxSize: { width: 12, height: 6 },
      configurable: true
    }
  ];

  // Signals for reactive state
  dashboards = signal<DashboardConfig[]>([]);
  currentDashboard = signal<DashboardConfig | null>(null);
  isEditMode = signal(false);

  constructor(private http: HttpClient) {
    this.loadDashboards();
  }

  /**
   * Load all dashboards from localStorage (or API in the future)
   */
  loadDashboards(): void {
    // Try to load from localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY);

    if (stored) {
      try {
        const dashboards = JSON.parse(stored) as DashboardConfig[];
        this.dashboards.set(dashboards);

        // Load current dashboard
        const currentId = localStorage.getItem(this.CURRENT_DASHBOARD_KEY);
        if (currentId) {
          const current = dashboards.find(d => d.id === currentId);
          if (current) {
            this.currentDashboard.set(current);
            return;
          }
        }

        // Fallback to default dashboard
        const defaultDashboard = dashboards.find(d => d.isDefault);
        this.currentDashboard.set(defaultDashboard || dashboards[0] || null);
      } catch (error) {
        console.error('Failed to load dashboards:', error);
        this.createDefaultDashboard();
      }
    } else {
      // No stored dashboards, create default
      this.createDefaultDashboard();
    }
  }

  /**
   * Create the default dashboard with initial widgets
   */
  private createDefaultDashboard(): void {
    const defaultDashboard: DashboardConfig = {
      id: this.generateId(),
      name: 'My Dashboard',
      description: 'Your main dashboard',
      isDefault: true,
      layout: {
        columns: 2,
        widgets: [
          {
            id: this.generateId(),
            type: 'overview-stats',
            title: 'Overview Stats',
            position: { row: 0, col: 0 },
            size: { width: 12, height: 2 },
            settings: {}
          },
          {
            id: this.generateId(),
            type: 'my-issues',
            title: 'My Issues',
            position: { row: 2, col: 0 },
            size: { width: 6, height: 4 },
            settings: { limit: 10 }
          },
          {
            id: this.generateId(),
            type: 'recent-activity',
            title: 'Recent Activity',
            position: { row: 2, col: 6 },
            size: { width: 6, height: 4 },
            settings: { limit: 5 }
          },
          {
            id: this.generateId(),
            type: 'velocity-chart',
            title: 'Sprint Velocity',
            position: { row: 6, col: 0 },
            size: { width: 6, height: 5 },
            settings: { sprints: 6 }
          },
          {
            id: this.generateId(),
            type: 'burndown-chart',
            title: 'Sprint Burndown',
            position: { row: 6, col: 6 },
            size: { width: 6, height: 5 },
            settings: {}
          },
          {
            id: this.generateId(),
            type: 'issue-distribution',
            title: 'Issue Distribution',
            position: { row: 11, col: 0 },
            size: { width: 6, height: 5 },
            settings: { groupBy: 'status' }
          }
        ]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dashboards.set([defaultDashboard]);
    this.currentDashboard.set(defaultDashboard);
    this.saveDashboards();
  }

  /**
   * Save dashboards to localStorage
   */
  private saveDashboards(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.dashboards()));

    const current = this.currentDashboard();
    if (current) {
      localStorage.setItem(this.CURRENT_DASHBOARD_KEY, current.id);
    }
  }

  /**
   * Switch to a different dashboard
   */
  setCurrentDashboard(dashboardId: string): void {
    const dashboard = this.dashboards().find(d => d.id === dashboardId);
    if (dashboard) {
      this.currentDashboard.set(dashboard);
      localStorage.setItem(this.CURRENT_DASHBOARD_KEY, dashboardId);
    }
  }

  /**
   * Create a new dashboard
   */
  createDashboard(name: string, description?: string): DashboardConfig {
    const newDashboard: DashboardConfig = {
      id: this.generateId(),
      name,
      description,
      isDefault: false,
      layout: {
        columns: 2,
        widgets: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dashboards.update(dashboards => [...dashboards, newDashboard]);
    this.saveDashboards();

    return newDashboard;
  }

  /**
   * Delete a dashboard
   */
  deleteDashboard(dashboardId: string): void {
    const dashboards = this.dashboards().filter(d => d.id !== dashboardId);
    this.dashboards.set(dashboards);

    // If we deleted the current dashboard, switch to another
    if (this.currentDashboard()?.id === dashboardId) {
      const defaultDashboard = dashboards.find(d => d.isDefault) || dashboards[0];
      this.currentDashboard.set(defaultDashboard || null);
    }

    this.saveDashboards();
  }

  /**
   * Update dashboard metadata
   */
  updateDashboard(dashboardId: string, updates: Partial<DashboardConfig>): void {
    this.dashboards.update(dashboards =>
      dashboards.map(d =>
        d.id === dashboardId
          ? { ...d, ...updates, updatedAt: new Date() }
          : d
      )
    );

    // Update current dashboard if it's the one being updated
    if (this.currentDashboard()?.id === dashboardId) {
      this.currentDashboard.update(current =>
        current ? { ...current, ...updates, updatedAt: new Date() } : null
      );
    }

    this.saveDashboards();
  }

  /**
   * Add a widget to the current dashboard
   */
  addWidget(widgetType: WidgetType, customSettings?: Record<string, any>): void {
    const current = this.currentDashboard();
    if (!current) return;

    const definition = this.widgetDefinitions.find(d => d.type === widgetType);
    if (!definition) return;

    // Find next available position
    const position = this.findNextPosition(current, definition.defaultSize);

    const newWidget: WidgetConfig = {
      id: this.generateId(),
      type: widgetType,
      title: definition.name,
      position,
      size: definition.defaultSize,
      settings: customSettings || {}
    };

    current.layout.widgets.push(newWidget);
    current.updatedAt = new Date();

    this.currentDashboard.set({ ...current });
    this.updateDashboardInList(current);
    this.saveDashboards();
  }

  /**
   * Remove a widget from the current dashboard
   */
  removeWidget(widgetId: string): void {
    const current = this.currentDashboard();
    if (!current) return;

    current.layout.widgets = current.layout.widgets.filter(w => w.id !== widgetId);
    current.updatedAt = new Date();

    this.currentDashboard.set({ ...current });
    this.updateDashboardInList(current);
    this.saveDashboards();
  }

  /**
   * Update widget configuration
   */
  updateWidget(widgetId: string, updates: Partial<WidgetConfig>): void {
    const current = this.currentDashboard();
    if (!current) return;

    current.layout.widgets = current.layout.widgets.map(w =>
      w.id === widgetId ? { ...w, ...updates } : w
    );
    current.updatedAt = new Date();

    this.currentDashboard.set({ ...current });
    this.updateDashboardInList(current);
    this.saveDashboards();
  }

  /**
   * Update widget position (for drag & drop)
   */
  updateWidgetPosition(widgetId: string, position: { row: number; col: number }): void {
    this.updateWidget(widgetId, { position });
  }

  /**
   * Update widget size (for resize)
   */
  updateWidgetSize(widgetId: string, size: { width: number; height: number }): void {
    this.updateWidget(widgetId, { size });
  }

  /**
   * Toggle edit mode
   */
  toggleEditMode(): void {
    this.isEditMode.update(mode => !mode);
  }

  /**
   * Get widget definition by type
   */
  getWidgetDefinition(type: WidgetType): WidgetDefinition | undefined {
    return this.widgetDefinitions.find(d => d.type === type);
  }

  /**
   * Find next available position for a new widget
   */
  private findNextPosition(dashboard: DashboardConfig, size: { width: number; height: number }): { row: number; col: number } {
    if (dashboard.layout.widgets.length === 0) {
      return { row: 0, col: 0 };
    }

    // Find the bottom-most widget
    const maxRow = Math.max(...dashboard.layout.widgets.map(w => w.position.row + w.size.height));

    return { row: maxRow, col: 0 };
  }

  /**
   * Update a dashboard in the list
   */
  private updateDashboardInList(dashboard: DashboardConfig): void {
    this.dashboards.update(dashboards =>
      dashboards.map(d => d.id === dashboard.id ? dashboard : d)
    );
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
