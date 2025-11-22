import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DashboardLayoutService, DashboardConfig } from '../../../core/services/dashboard-layout.service';

@Component({
  selector: 'app-dashboard-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ButtonComponent],
  template: `
    <div class="manager-overlay" (click)="onClose()">
      <div class="manager-dialog" (click)="$event.stopPropagation()">
        <div class="manager-header">
          <h2>Manage Dashboards</h2>
          <button class="close-btn" (click)="onClose()">
            <jira-icon name="close" [size]="20" />
          </button>
        </div>

        <div class="manager-content">
          <!-- Create New Dashboard Section -->
          <div class="create-section">
            <h3>Create New Dashboard</h3>
            <div class="create-form">
              <input
                type="text"
                class="form-input"
                [(ngModel)]="newDashboardName"
                placeholder="Dashboard name"
                (keyup.enter)="createDashboard()"
              />
              <input
                type="text"
                class="form-input"
                [(ngModel)]="newDashboardDescription"
                placeholder="Description (optional)"
                (keyup.enter)="createDashboard()"
              />
              <jira-button
                variant="primary"
                size="medium"
                (clicked)="createDashboard()"
                [disabled]="!newDashboardName.trim()"
              >
                <jira-icon leftIcon name="plus" [size]="16" />
                Create Dashboard
              </jira-button>
            </div>
          </div>

          <!-- Dashboards List -->
          <div class="dashboards-section">
            <h3>Your Dashboards</h3>
            <div class="dashboards-list">
              <div
                *ngFor="let dashboard of layoutService.dashboards()"
                class="dashboard-item"
                [class.active]="isCurrentDashboard(dashboard)"
                [class.editing]="editingDashboard()?.id === dashboard.id"
              >
                <div class="dashboard-icon">
                  <jira-icon
                    [name]="dashboard.isDefault ? 'star' : 'dashboard'"
                    [size]="24"
                    [color]="isCurrentDashboard(dashboard) ? 'var(--jira-brand-primary)' : 'var(--jira-neutral-600)'"
                  />
                </div>

                <div class="dashboard-info" *ngIf="editingDashboard()?.id !== dashboard.id">
                  <div class="dashboard-name">
                    {{ dashboard.name }}
                    <span class="default-badge" *ngIf="dashboard.isDefault">Default</span>
                  </div>
                  <div class="dashboard-meta">
                    {{ dashboard.description || 'No description' }} •
                    {{ dashboard.layout.widgets.length }} widget{{dashboard.layout.widgets.length !== 1 ? 's' : ''}}
                  </div>
                </div>

                <div class="dashboard-edit-form" *ngIf="editingDashboard()?.id === dashboard.id">
                  <input
                    type="text"
                    class="form-input"
                    [(ngModel)]="editName"
                    placeholder="Dashboard name"
                    (keyup.enter)="saveEdit(dashboard)"
                  />
                  <input
                    type="text"
                    class="form-input"
                    [(ngModel)]="editDescription"
                    placeholder="Description"
                    (keyup.enter)="saveEdit(dashboard)"
                  />
                </div>

                <div class="dashboard-actions">
                  <button
                    *ngIf="editingDashboard()?.id !== dashboard.id && !isCurrentDashboard(dashboard)"
                    class="action-btn"
                    (click)="switchToDashboard(dashboard)"
                    title="Switch to this dashboard"
                  >
                    <jira-icon name="chevron-right" [size]="16" />
                  </button>

                  <button
                    *ngIf="editingDashboard()?.id !== dashboard.id"
                    class="action-btn"
                    (click)="startEdit(dashboard)"
                    title="Rename dashboard"
                  >
                    <jira-icon name="edit" [size]="16" />
                  </button>

                  <button
                    *ngIf="editingDashboard()?.id === dashboard.id"
                    class="action-btn success"
                    (click)="saveEdit(dashboard)"
                    title="Save changes"
                  >
                    <jira-icon name="check" [size]="16" />
                  </button>

                  <button
                    *ngIf="editingDashboard()?.id === dashboard.id"
                    class="action-btn"
                    (click)="cancelEdit()"
                    title="Cancel"
                  >
                    <jira-icon name="close" [size]="16" />
                  </button>

                  <button
                    *ngIf="editingDashboard()?.id !== dashboard.id && !dashboard.isDefault"
                    class="action-btn danger"
                    (click)="deleteDashboard(dashboard)"
                    title="Delete dashboard"
                  >
                    <jira-icon name="delete" [size]="16" />
                  </button>
                </div>
              </div>

              <div *ngIf="layoutService.dashboards().length === 0" class="empty-state">
                <jira-icon name="dashboard" [size]="48" color="var(--jira-neutral-400)" />
                <p>No dashboards found</p>
              </div>
            </div>
          </div>
        </div>

        <div class="manager-footer">
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
      max-width: 700px;
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
      margin: 0 0 var(--spacing-md) 0;
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

    .create-section {
      padding: var(--spacing-lg);
      background: var(--jira-neutral-50);
      border-radius: var(--radius-md);
      border: 1px solid var(--jira-neutral-200);
    }

    .create-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .form-input {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      border: 2px solid var(--jira-neutral-300);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-1000);
      background: var(--jira-neutral-0);
      transition: border-color var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--jira-brand-primary);
      }

      &::placeholder {
        color: var(--jira-neutral-500);
      }
    }

    .dashboards-section {
      flex: 1;
    }

    .dashboards-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .dashboard-item {
      display: flex;
      align-items: center;
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

      &.editing {
        border-color: var(--jira-brand-primary);
        background: var(--jira-neutral-50);
      }
    }

    .dashboard-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--jira-neutral-100);
      border-radius: var(--radius-md);
    }

    .dashboard-info {
      flex: 1;
      min-width: 0;
    }

    .dashboard-edit-form {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .dashboard-name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-xs);
    }

    .default-badge {
      display: inline-block;
      padding: 2px var(--spacing-xs);
      background: var(--jira-warning-bg);
      color: var(--jira-warning);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      border-radius: var(--radius-sm);
    }

    .dashboard-meta {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
    }

    .dashboard-actions {
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

      &.success:hover {
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
      padding: var(--spacing-2xl);
      text-align: center;

      p {
        color: var(--jira-neutral-600);
        margin-top: var(--spacing-md);
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

      .dashboard-item {
        flex-wrap: wrap;
      }

      .dashboard-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class DashboardManagerComponent {
  @Output() close = new EventEmitter<void>();

  newDashboardName = '';
  newDashboardDescription = '';
  editingDashboard = signal<DashboardConfig | null>(null);
  editName = '';
  editDescription = '';

  constructor(public layoutService: DashboardLayoutService) {}

  isCurrentDashboard(dashboard: DashboardConfig): boolean {
    return this.layoutService.currentDashboard()?.id === dashboard.id;
  }

  createDashboard(): void {
    if (!this.newDashboardName.trim()) return;

    const newDashboard = this.layoutService.createDashboard(
      this.newDashboardName.trim(),
      this.newDashboardDescription.trim() || undefined
    );

    // Switch to the new dashboard
    this.layoutService.setCurrentDashboard(newDashboard.id);

    // Clear form
    this.newDashboardName = '';
    this.newDashboardDescription = '';
  }

  switchToDashboard(dashboard: DashboardConfig): void {
    this.layoutService.setCurrentDashboard(dashboard.id);
  }

  startEdit(dashboard: DashboardConfig): void {
    this.editingDashboard.set(dashboard);
    this.editName = dashboard.name;
    this.editDescription = dashboard.description || '';
  }

  saveEdit(dashboard: DashboardConfig): void {
    if (!this.editName.trim()) return;

    this.layoutService.updateDashboard(dashboard.id, {
      name: this.editName.trim(),
      description: this.editDescription.trim() || undefined
    });

    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingDashboard.set(null);
    this.editName = '';
    this.editDescription = '';
  }

  deleteDashboard(dashboard: DashboardConfig): void {
    if (confirm(`Delete "${dashboard.name}"? This action cannot be undone.`)) {
      this.layoutService.deleteDashboard(dashboard.id);
    }
  }

  onClose(): void {
    this.cancelEdit();
    this.close.emit();
  }
}
