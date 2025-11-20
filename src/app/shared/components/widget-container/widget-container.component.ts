import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { WidgetConfig } from '../../../core/services/dashboard-layout.service';

@Component({
  selector: 'app-widget-container',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="widget-container" [class.edit-mode]="editMode">
      <div class="widget-header" *ngIf="showHeader">
        <h3 class="widget-title">{{ widget.title }}</h3>

        <div class="widget-actions">
          <button class="widget-action-btn" (click)="onRefresh()" title="Actualiser" *ngIf="editMode">
            <jira-icon name="arrow-up" [size]="16" />
          </button>
          <button class="widget-action-btn" (click)="onSettings()" title="Paramètres">
            <jira-icon name="settings" [size]="16" />
          </button>
          <button class="widget-action-btn danger" (click)="onRemove()" title="Supprimer" *ngIf="editMode">
            <jira-icon name="delete" [size]="16" />
          </button>
        </div>
      </div>

      <div class="widget-content">
        <ng-content></ng-content>
      </div>

      <div class="widget-edit-overlay" *ngIf="editMode">
        <div class="edit-handle">
          <jira-icon name="menu" [size]="20" />
          <span>Drag to reorder</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .widget-container {
      position: relative;
      background: var(--jira-neutral-0);
      border: 2px solid var(--jira-neutral-200);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: all var(--transition-fast);
      height: 100%;
      display: flex;
      flex-direction: column;

      &.edit-mode {
        border-color: var(--jira-brand-primary);
        box-shadow: 0 0 0 2px var(--jira-info-bg);

        &:hover {
          box-shadow: 0 0 0 2px var(--jira-info-bg), var(--shadow-lg);
        }
      }
    }

    .widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--jira-neutral-200);
      background: var(--jira-neutral-50);
    }

    .widget-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      margin: 0;
    }

    .widget-actions {
      display: flex;
      gap: var(--spacing-xs);
    }

    .widget-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
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

      &.danger:hover {
        background: var(--jira-danger-bg);
        color: var(--jira-danger);
      }
    }

    .widget-content {
      flex: 1;
      overflow: auto;
      position: relative;
    }

    .widget-edit-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--transition-fast);
    }

    .widget-container.edit-mode:hover .widget-edit-overlay {
      opacity: 1;
    }

    .edit-handle {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xl);
      background: var(--jira-neutral-0);
      border: 2px dashed var(--jira-brand-primary);
      border-radius: var(--radius-md);
      color: var(--jira-brand-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: move;
    }
  `]
})
export class WidgetContainerComponent {
  @Input() widget!: WidgetConfig;
  @Input() editMode = false;
  @Input() showHeader = true;

  @Output() refresh = new EventEmitter<void>();
  @Output() settings = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  onRefresh(): void {
    this.refresh.emit();
  }

  onSettings(): void {
    this.settings.emit();
  }

  onRemove(): void {
    if (confirm(`Remove "${this.widget.title}" widget?`)) {
      this.remove.emit();
    }
  }
}
