import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { ToastService, Toast, ToastType } from '../../../core/services/toast.service';
import { IconName } from '../icon/icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="toast"
        [class]="'toast-' + toast.type"
      >
        <div class="toast-icon">
          <jira-icon [name]="getIcon(toast.type)" [size]="18" />
        </div>
        <div class="toast-content">
          <h4 *ngIf="toast.title" class="toast-title">{{ toast.title }}</h4>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button
          *ngIf="toast.dismissible"
          class="toast-close"
          (click)="toastService.dismiss(toast.id)"
        >
          <jira-icon name="close" [size]="14" />
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: var(--spacing-lg);
      right: var(--spacing-lg);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: var(--jira-neutral-0);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      min-width: 300px;
      max-width: 500px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .toast-success .toast-icon {
      background: var(--jira-success-bg);
      color: var(--jira-success);
    }

    .toast-error .toast-icon {
      background: var(--jira-danger-bg);
      color: var(--jira-danger);
    }

    .toast-warning .toast-icon {
      background: var(--jira-warning-bg);
      color: var(--jira-warning);
    }

    .toast-info .toast-icon {
      background: var(--jira-info-bg);
      color: var(--jira-brand-primary);
    }

    .toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .toast-title {
      margin: 0;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
    }

    .toast-message {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-800);
      line-height: 1.4;
    }

    .toast-close {
      flex-shrink: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 4px;
      color: var(--jira-neutral-600);
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: var(--jira-neutral-1000);
    }

    @media (max-width: 640px) {
      .toast-container {
        left: var(--spacing-md);
        right: var(--spacing-md);
      }

      .toast {
        min-width: auto;
      }
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getIcon(type: ToastType): IconName {
    const icons: Record<ToastType, IconName> = {
      success: 'check',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type];
  }
}
