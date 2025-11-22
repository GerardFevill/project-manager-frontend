import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'link' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'jira-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="handleClick($event)"
    >
      <span *ngIf="loading" class="spinner-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" opacity="0.25"/>
          <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
      <span [class.icon-content]="iconPosition === 'left' || iconPosition === 'right'">
        <ng-content select="[leftIcon]"></ng-content>
        <ng-content></ng-content>
        <ng-content select="[rightIcon]"></ng-content>
      </span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      font-family: var(--font-family);
      font-weight: var(--font-weight-medium);
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
      user-select: none;
      position: relative;

      &:focus-visible {
        outline: 2px solid var(--jira-brand-primary);
        outline-offset: 2px;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }
    }

    /* Sizes */
    .btn-small {
      height: 32px;
      padding: 0 var(--spacing-md);
      font-size: var(--font-size-sm);
    }

    .btn-medium {
      height: 36px;
      padding: 0 var(--spacing-lg);
      font-size: var(--font-size-md);
    }

    .btn-large {
      height: 44px;
      padding: 0 var(--spacing-xl);
      font-size: var(--font-size-lg);
    }

    /* Primary Variant */
    .btn-primary {
      background: var(--jira-brand-primary);
      color: white;

      &:hover:not(:disabled) {
        background: var(--jira-brand-primary-hover);
      }

      &:active:not(:disabled) {
        background: var(--jira-brand-primary-active);
      }
    }

    /* Secondary Variant */
    .btn-secondary {
      background: var(--jira-neutral-100);
      color: var(--jira-neutral-800);

      &:hover:not(:disabled) {
        background: var(--jira-neutral-200);
      }

      &:active:not(:disabled) {
        background: var(--jira-neutral-300);
      }
    }

    /* Subtle Variant */
    .btn-subtle {
      background: transparent;
      color: var(--jira-neutral-800);

      &:hover:not(:disabled) {
        background: var(--jira-neutral-100);
      }

      &:active:not(:disabled) {
        background: var(--jira-neutral-200);
      }
    }

    /* Link Variant */
    .btn-link {
      background: transparent;
      color: var(--jira-brand-primary);
      padding: 0 var(--spacing-xs);

      &:hover:not(:disabled) {
        color: var(--jira-brand-primary-hover);
        text-decoration: underline;
      }
    }

    /* Danger Variant */
    .btn-danger {
      background: var(--jira-danger);
      color: white;

      &:hover:not(:disabled) {
        background: #BF2600;
      }

      &:active:not(:disabled) {
        background: #A32100;
      }
    }

    .spinner-icon {
      display: inline-flex;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .icon-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() iconPosition: 'left' | 'right' | null = null;

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const classes = [
      `btn-${this.variant}`,
      `btn-${this.size}`
    ];

    if (this.fullWidth) {
      classes.push('w-full');
    }

    return classes.join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
