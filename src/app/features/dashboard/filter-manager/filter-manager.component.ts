import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FilterBuilderComponent, Filter } from '../../../shared/components/filter-builder/filter-builder.component';
import { FilterService } from '../../../core/services/filter.service';

@Component({
  selector: 'app-filter-manager',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, FilterBuilderComponent],
  template: `
    <div class="manager-overlay" (click)="onClose()">
      <div class="manager-dialog" (click)="$event.stopPropagation()">
        <div class="manager-header">
          <h2>Filters</h2>
          <button class="close-btn" (click)="onClose()">
            <jira-icon name="close" [size]="20" />
          </button>
        </div>

        <!-- Filter Builder or Filters List -->
        <div class="manager-content" *ngIf="!showBuilder()">
          <!-- Active Filter Banner -->
          <div class="active-filter-banner" *ngIf="filterService.activeFilter()">
            <div class="banner-content">
              <jira-icon name="filter" [size]="20" color="var(--jira-brand-primary)" />
              <div class="banner-text">
                <div class="banner-title">Active Filter: {{ filterService.activeFilter()!.name }}</div>
                <div class="banner-desc">{{ filterService.toJQL(filterService.activeFilter()!) }}</div>
              </div>
            </div>
            <button class="clear-btn" (click)="clearActiveFilter()">
              <jira-icon name="close" [size]="16" />
              Clear
            </button>
          </div>

          <!-- Create New Filter -->
          <div class="create-section">
            <h3>Create New Filter</h3>
            <p class="section-desc">Build custom filters to find exactly what you need</p>
            <jira-button
              variant="primary"
              size="medium"
              (clicked)="createNewFilter()"
            >
              <jira-icon leftIcon name="plus" [size]="16" />
              New Filter
            </jira-button>
          </div>

          <!-- Saved Filters -->
          <div class="filters-section">
            <h3>Saved Filters ({{ filterService.savedFilters().length }})</h3>
            <div class="filters-list">
              <div
                *ngFor="let filter of filterService.savedFilters()"
                class="filter-item"
                [class.active]="isActiveFilter(filter)"
              >
                <div class="filter-icon">
                  <jira-icon
                    name="filter"
                    [size]="24"
                    [color]="isActiveFilter(filter) ? 'var(--jira-brand-primary)' : 'var(--jira-neutral-600)'"
                  />
                </div>

                <div class="filter-info">
                  <div class="filter-name">{{ filter.name }}</div>
                  <div class="filter-meta">
                    {{ filter.description || 'No description' }}
                  </div>
                  <div class="filter-jql">
                    <code>{{ filterService.toJQL(filter) }}</code>
                  </div>
                </div>

                <div class="filter-actions">
                  <button
                    *ngIf="!isActiveFilter(filter)"
                    class="action-btn primary"
                    (click)="applyFilter(filter)"
                    title="Apply filter"
                  >
                    <jira-icon name="check" [size]="16" />
                  </button>

                  <button
                    class="action-btn"
                    (click)="editFilter(filter)"
                    title="Edit filter"
                  >
                    <jira-icon name="edit" [size]="16" />
                  </button>

                  <button
                    class="action-btn danger"
                    (click)="deleteFilter(filter)"
                    title="Delete filter"
                  >
                    <jira-icon name="delete" [size]="16" />
                  </button>
                </div>
              </div>

              <div *ngIf="filterService.savedFilters().length === 0" class="empty-state">
                <jira-icon name="filter" [size]="48" color="var(--jira-neutral-400)" />
                <p>No saved filters</p>
                <span>Create your first filter to get started</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Builder View -->
        <div class="builder-content" *ngIf="showBuilder()">
          <app-filter-builder
            [filter]="editingFilter()"
            (save)="onFilterSave($event)"
            (cancel)="onBuilderCancel()"
          />
        </div>

        <div class="manager-footer" *ngIf="!showBuilder()">
          <jira-button variant="secondary" (clicked)="onClose()">
            Close
          </jira-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manager-overlay {
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

    .manager-dialog {
      background: var(--jira-neutral-0);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 90%;
      max-width: 900px;
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

    .manager-header {
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

    h3 {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      margin: 0 0 var(--spacing-xs) 0;
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

    .manager-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-xl);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2xl);
    }

    .builder-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-xl);
    }

    .active-filter-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-lg);
      background: var(--jira-info-bg);
      border: 2px solid var(--jira-brand-primary);
      border-radius: var(--radius-md);
      gap: var(--spacing-md);
    }

    .banner-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex: 1;
      min-width: 0;
    }

    .banner-text {
      flex: 1;
      min-width: 0;
    }

    .banner-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-brand-primary);
      margin-bottom: var(--spacing-xs);
    }

    .banner-desc {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-700);
      font-family: 'Monaco', 'Menlo', monospace;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .clear-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      border: none;
      background: var(--jira-neutral-0);
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-700);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--jira-danger-bg);
        color: var(--jira-danger);
      }
    }

    .create-section {
      padding: var(--spacing-lg);
      background: var(--jira-neutral-50);
      border-radius: var(--radius-md);
      border: 1px solid var(--jira-neutral-200);
    }

    .section-desc {
      color: var(--jira-neutral-600);
      font-size: var(--font-size-sm);
      margin: var(--spacing-sm) 0 var(--spacing-md) 0;
    }

    .filters-section {
      flex: 1;
    }

    .filters-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .filter-item {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--jira-neutral-0);
      border: 2px solid var(--jira-neutral-200);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--jira-brand-primary);
      }

      &.active {
        background: var(--jira-info-bg);
        border-color: var(--jira-brand-primary);
      }
    }

    .filter-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--jira-neutral-100);
      border-radius: var(--radius-md);
    }

    .filter-info {
      flex: 1;
      min-width: 0;
    }

    .filter-name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      margin-bottom: var(--spacing-xs);
    }

    .filter-meta {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      margin-bottom: var(--spacing-xs);
    }

    .filter-jql {
      code {
        display: inline-block;
        padding: 2px var(--spacing-xs);
        background: var(--jira-neutral-100);
        border-radius: var(--radius-sm);
        color: var(--jira-neutral-700);
        font-size: var(--font-size-xs);
        font-family: 'Monaco', 'Menlo', monospace;
      }
    }

    .filter-actions {
      display: flex;
      gap: var(--spacing-xs);
      flex-shrink: 0;
    }

    .action-btn {
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

      &.primary:hover {
        background: var(--jira-success-bg);
        color: var(--jira-success);
      }

      &.danger:hover {
        background: var(--jira-danger-bg);
        color: var(--jira-danger);
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;

      p {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--jira-neutral-800);
        margin: var(--spacing-md) 0 var(--spacing-xs) 0;
      }

      span {
        color: var(--jira-neutral-600);
        font-size: var(--font-size-sm);
      }
    }

    .manager-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--spacing-md);
      padding: var(--spacing-lg) var(--spacing-xl);
      border-top: 1px solid var(--jira-neutral-200);
    }

    @media (max-width: 768px) {
      .manager-dialog {
        width: 95%;
        max-height: 95vh;
      }

      .filter-item {
        flex-wrap: wrap;
      }

      .filter-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class FilterManagerComponent {
  @Output() close = new EventEmitter<void>();

  showBuilder = signal(false);
  editingFilter = signal<Filter | undefined>(undefined);

  constructor(public filterService: FilterService) {}

  isActiveFilter(filter: Filter): boolean {
    return this.filterService.activeFilter()?.id === filter.id;
  }

  createNewFilter(): void {
    this.editingFilter.set(undefined);
    this.showBuilder.set(true);
  }

  editFilter(filter: Filter): void {
    this.editingFilter.set(filter);
    this.showBuilder.set(true);
  }

  applyFilter(filter: Filter): void {
    this.filterService.setActiveFilter(filter);
  }

  clearActiveFilter(): void {
    this.filterService.setActiveFilter(null);
  }

  deleteFilter(filter: Filter): void {
    if (confirm(`Supprimer le filtre "${filter.name}" ? Cette action est irréversible.`)) {
      this.filterService.deleteFilter(filter.id);
    }
  }

  onFilterSave(filter: Filter): void {
    this.filterService.saveFilter(filter);
    this.showBuilder.set(false);
    this.editingFilter.set(undefined);
  }

  onBuilderCancel(): void {
    this.showBuilder.set(false);
    this.editingFilter.set(undefined);
  }

  onClose(): void {
    this.showBuilder.set(false);
    this.editingFilter.set(undefined);
    this.close.emit();
  }
}
