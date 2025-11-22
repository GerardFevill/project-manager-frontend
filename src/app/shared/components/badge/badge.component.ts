import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'small' | 'medium';

@Component({
  selector: 'jira-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      font-family: var(--font-family);
      font-weight: var(--font-weight-medium);
      line-height: 1;
      white-space: nowrap;
    }

    /* Sizes */
    .badge-small {
      height: 18px;
      padding: 0 var(--spacing-xs);
      font-size: var(--font-size-xs);
    }

    .badge-medium {
      height: 22px;
      padding: 0 var(--spacing-sm);
      font-size: var(--font-size-sm);
    }

    /* Variants */
    .badge-default {
      background: var(--jira-neutral-200);
      color: var(--jira-neutral-800);
    }

    .badge-primary {
      background: var(--jira-info-bg);
      color: var(--jira-info);
    }

    .badge-success {
      background: var(--jira-success-bg);
      color: var(--jira-success);
    }

    .badge-warning {
      background: var(--jira-warning-bg);
      color: #974F0C;
    }

    .badge-danger {
      background: var(--jira-danger-bg);
      color: var(--jira-danger);
    }

    .badge-info {
      background: var(--jira-info-bg);
      color: var(--jira-info);
    }
  `]
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'medium';

  get badgeClasses(): string {
    return `badge badge-${this.variant} badge-${this.size}`;
  }
}
