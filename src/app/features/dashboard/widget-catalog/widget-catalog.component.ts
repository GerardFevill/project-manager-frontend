import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DashboardLayoutService, WidgetDefinition, WidgetType } from '../../../core/services/dashboard-layout.service';

@Component({
  selector: 'app-widget-catalog',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  template: `
    <div class="catalog-overlay" (click)="onClose()">
      <div class="catalog-dialog" (click)="$event.stopPropagation()">
        <div class="catalog-header">
          <h2>Add Widget</h2>
          <button class="close-btn" (click)="onClose()">
            <jira-icon name="close" [size]="20" />
          </button>
        </div>

        <div class="catalog-filters">
          <button
            *ngFor="let cat of categories"
            class="filter-btn"
            [class.active]="selectedCategory() === cat.value"
            (click)="selectedCategory.set(cat.value)"
          >
            <jira-icon [name]="cat.icon" [size]="16" />
            {{ cat.label }}
          </button>
        </div>

        <div class="catalog-grid">
          <div
            *ngFor="let widget of filteredWidgets()"
            class="widget-card"
            (click)="selectWidget(widget)"
            [class.selected]="selectedWidget()?.type === widget.type"
          >
            <div class="widget-card-icon">
              <jira-icon [name]="widget.icon" [size]="32" [color]="'var(--jira-brand-primary)'" />
            </div>
            <div class="widget-card-content">
              <h3>{{ widget.name }}</h3>
              <p>{{ widget.description }}</p>
            </div>
            <div class="widget-card-badge">{{ widget.category }}</div>
          </div>
        </div>

        <div class="catalog-footer">
          <jira-button variant="secondary" (clicked)="onClose()">
            Cancel
          </jira-button>
          <jira-button
            variant="primary"
            (clicked)="onAdd()"
            [disabled]="!selectedWidget()"
          >
            Add Widget
          </jira-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(9, 30, 66, 0.54);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .catalog-dialog {
      background: var(--jira-neutral-0);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .catalog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-xl);
      border-bottom: 1px solid var(--jira-neutral-200);
    }

    h2 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      margin: 0;
    }

    .close-btn {
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
        background: var(--jira-neutral-100);
        color: var(--jira-neutral-1000);
      }
    }

    .catalog-filters {
      display: flex;
      gap: var(--spacing-sm);
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--jira-neutral-200);
      overflow-x: auto;
    }

    .filter-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--jira-neutral-300);
      background: var(--jira-neutral-0);
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-800);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;

      &:hover {
        border-color: var(--jira-brand-primary);
        color: var(--jira-brand-primary);
      }

      &.active {
        background: var(--jira-info-bg);
        border-color: var(--jira-brand-primary);
        color: var(--jira-brand-primary);
      }
    }

    .catalog-grid {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-lg);
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--spacing-lg);
      align-content: start;
    }

    .widget-card {
      position: relative;
      padding: var(--spacing-lg);
      border: 2px solid var(--jira-neutral-200);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      background: var(--jira-neutral-0);

      &:hover {
        border-color: var(--jira-brand-primary);
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }

      &.selected {
        border-color: var(--jira-brand-primary);
        background: var(--jira-info-bg);
        box-shadow: var(--shadow-md);
      }
    }

    .widget-card-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--jira-info-bg);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-md);
    }

    .widget-card-content {
      margin-bottom: var(--spacing-md);
    }

    .widget-card-content h3 {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .widget-card-content p {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      margin: 0;
      line-height: 1.4;
    }

    .widget-card-badge {
      display: inline-block;
      padding: 2px var(--spacing-xs);
      background: var(--jira-neutral-100);
      color: var(--jira-neutral-700);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      border-radius: var(--radius-sm);
      text-transform: capitalize;
    }

    .catalog-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--spacing-md);
      padding: var(--spacing-lg) var(--spacing-xl);
      border-top: 1px solid var(--jira-neutral-200);
    }

    @media (max-width: 768px) {
      .catalog-dialog {
        width: 95%;
        max-height: 95vh;
      }

      .catalog-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WidgetCatalogComponent {
  @Output() close = new EventEmitter<void>();
  @Output() addWidget = new EventEmitter<WidgetType>();

  selectedWidget = signal<WidgetDefinition | null>(null);
  selectedCategory = signal<string>('all');

  categories = [
    { value: 'all', label: 'All', icon: 'dashboard' as const },
    { value: 'charts', label: 'Charts', icon: 'reports' as const },
    { value: 'lists', label: 'Lists', icon: 'issues' as const },
    { value: 'stats', label: 'Stats', icon: 'star' as const },
    { value: 'activity', label: 'Activity', icon: 'clock' as const }
  ];

  constructor(public layoutService: DashboardLayoutService) {}

  filteredWidgets = signal<WidgetDefinition[]>([]);

  ngOnInit() {
    this.updateFilteredWidgets();
  }

  ngDoCheck() {
    this.updateFilteredWidgets();
  }

  updateFilteredWidgets() {
    const category = this.selectedCategory();
    const widgets = category === 'all'
      ? this.layoutService.widgetDefinitions
      : this.layoutService.widgetDefinitions.filter(w => w.category === category);

    this.filteredWidgets.set(widgets);
  }

  selectWidget(widget: WidgetDefinition): void {
    this.selectedWidget.set(widget);
  }

  onAdd(): void {
    const widget = this.selectedWidget();
    if (widget) {
      this.addWidget.emit(widget.type);
      this.onClose();
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
