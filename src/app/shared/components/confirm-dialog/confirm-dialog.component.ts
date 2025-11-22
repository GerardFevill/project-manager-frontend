import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, IconName } from '../icon/icon.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  template: `
    <div class="dialog-overlay" (click)="onCancel()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header" [class]="'dialog-header-' + type">
          <div class="dialog-icon">
            <jira-icon [name]="getIcon()" [size]="24" />
          </div>
          <button class="close-btn" (click)="onCancel()">
            <jira-icon name="close" [size]="16" />
          </button>
        </div>

        <div class="dialog-body">
          <h2>{{ title }}</h2>
          <p>{{ message }}</p>
          <p *ngIf="subMessage" class="sub-message">{{ subMessage }}</p>
        </div>

        <div class="dialog-footer">
          <jira-button
            variant="subtle"
            size="medium"
            (clicked)="onCancel()"
          >
            {{ cancelText }}
          </jira-button>
          <jira-button
            [variant]="type === 'danger' ? 'danger' : 'primary'"
            size="medium"
            (clicked)="onConfirm()"
          >
            {{ confirmText }}
          </jira-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .dialog {
      background: var(--jira-neutral-0);
      border-radius: var(--radius-lg);
      width: 480px;
      max-width: 90vw;
      box-shadow: var(--shadow-xl);
      animation: slideUp 0.2s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .dialog-header {
      position: relative;
      padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      border-bottom: 1px solid var(--jira-neutral-200);
    }

    .dialog-header-danger {
      background: linear-gradient(135deg, rgba(222, 53, 11, 0.05) 0%, rgba(222, 53, 11, 0.02) 100%);
    }

    .dialog-header-warning {
      background: linear-gradient(135deg, rgba(255, 171, 0, 0.05) 0%, rgba(255, 171, 0, 0.02) 100%);
    }

    .dialog-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dialog-header-danger .dialog-icon {
      background: var(--jira-danger-bg);
      color: var(--jira-danger);
    }

    .dialog-header-warning .dialog-icon {
      background: var(--jira-warning-bg);
      color: var(--jira-warning);
    }

    .close-btn {
      position: absolute;
      top: var(--spacing-md);
      right: var(--spacing-md);
      border: none;
      background: transparent;
      cursor: pointer;
      padding: var(--spacing-xs);
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-600);
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: var(--jira-neutral-100);
      color: var(--jira-neutral-900);
    }

    .dialog-body {
      padding: var(--spacing-lg) var(--spacing-xl);
    }

    .dialog-body h2 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
    }

    .dialog-body p {
      margin: 0;
      font-size: var(--font-size-md);
      color: var(--jira-neutral-700);
      line-height: 1.5;
    }

    .sub-message {
      margin-top: var(--spacing-sm);
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      font-style: italic;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-xl) var(--spacing-xl);
      border-top: 1px solid var(--jira-neutral-200);
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() subMessage?: string;
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() type: 'danger' | 'warning' | 'info' = 'warning';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  getIcon(): IconName {
    switch (this.type) {
      case 'danger':
        return 'warning';
      case 'warning':
        return 'info';
      default:
        return 'info';
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
