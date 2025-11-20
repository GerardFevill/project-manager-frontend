import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card' | 'list-item';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton"
      [class.text]="variant === 'text'"
      [class.circular]="variant === 'circular'"
      [class.rectangular]="variant === 'rectangular'"
      [class.card]="variant === 'card'"
      [class.list-item]="variant === 'list-item'"
      [style.width]="width"
      [style.height]="height"
    >
      <ng-container [ngSwitch]="variant">
        <div *ngSwitchCase="'card'" class="card-skeleton">
          <div class="skeleton-header">
            <div class="skeleton-avatar circular"></div>
            <div class="skeleton-text-group">
              <div class="skeleton-line short"></div>
              <div class="skeleton-line shorter"></div>
            </div>
          </div>
          <div class="skeleton-body">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line medium"></div>
          </div>
        </div>

        <div *ngSwitchCase="'list-item'" class="list-item-skeleton">
          <div class="skeleton-avatar circular"></div>
          <div class="skeleton-content">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .skeleton {
      background: linear-gradient(90deg, var(--jira-neutral-200) 25%, var(--jira-neutral-100) 50%, var(--jira-neutral-200) 75%);
      background-size: 200% 100%;
      animation: pulse 1.5s ease-in-out infinite;
      border-radius: var(--radius-sm);
    }

    .skeleton.text {
      height: 1em;
      width: 100%;
      border-radius: var(--radius-xs);
    }

    .skeleton.circular {
      border-radius: 50%;
      width: 40px;
      height: 40px;
    }

    .skeleton.rectangular {
      width: 100%;
      height: 100px;
    }

    .card-skeleton {
      padding: var(--spacing-md);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .skeleton-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .skeleton-avatar {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
    }

    .skeleton-text-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .skeleton-body {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .skeleton-line {
      height: 12px;
      background: var(--jira-neutral-200);
      border-radius: var(--radius-xs);
      animation: pulse 1.5s ease-in-out infinite;
    }

    .skeleton-line.shorter {
      width: 40%;
    }

    .skeleton-line.short {
      width: 60%;
    }

    .skeleton-line.medium {
      width: 80%;
    }

    .list-item-skeleton {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
    }

    .skeleton-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }
  `]
})
export class SkeletonComponent {
  @Input() variant: SkeletonVariant = 'rectangular';
  @Input() width?: string;
  @Input() height?: string;
  @Input() count = 1;
}
