import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { ButtonComponent } from '../button/button.component';
import { IconName } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  template: `
    <div class="empty-state" [class.compact]="compact">
      <div class="empty-icon" *ngIf="icon">
        <jira-icon [name]="icon" [size]="iconSize" [color]="iconColor" />
      </div>

      <div class="empty-content">
        <h3 class="empty-title" *ngIf="title">{{ title }}</h3>
        <p class="empty-description" *ngIf="description">{{ description }}</p>
      </div>

      <div class="empty-actions" *ngIf="actionLabel">
        <jira-button
          [variant]="actionVariant"
          [size]="compact ? 'small' : 'medium'"
          (click)="action.emit()"
        >
          <jira-icon *ngIf="actionIcon" leftIcon [name]="actionIcon" [size]="14" />
          {{ actionLabel }}
        </jira-button>
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;
      gap: var(--spacing-lg);
    }

    .empty-state.compact {
      padding: var(--spacing-xl);
      gap: var(--spacing-md);
    }

    .empty-icon {
      color: var(--jira-neutral-400);
      opacity: 0.5;
    }

    .empty-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      max-width: 400px;
    }

    .empty-title {
      margin: 0;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-900);
    }

    .empty-description {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      line-height: 1.5;
    }

    .empty-actions {
      margin-top: var(--spacing-sm);
    }

    .empty-state.compact .empty-title {
      font-size: var(--font-size-md);
    }

    .empty-state.compact .empty-description {
      font-size: var(--font-size-xs);
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon?: IconName;
  @Input() iconSize = 64;
  @Input() iconColor = 'var(--jira-neutral-400)';
  @Input() title?: string;
  @Input() description?: string;
  @Input() actionLabel?: string;
  @Input() actionIcon?: IconName;
  @Input() actionVariant: 'primary' | 'secondary' | 'subtle' = 'primary';
  @Input() compact = false;
  @Output() action = new EventEmitter<void>();
}
