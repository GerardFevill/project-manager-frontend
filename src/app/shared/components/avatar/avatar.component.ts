import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

@Component({
  selector: 'jira-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="avatarClasses()" [title]="name">
      <img
        *ngIf="src && !imageError()"
        [src]="src"
        [alt]="name"
        (error)="onImageError()"
      />
      <span *ngIf="!src || imageError()" class="avatar-initials">
        {{ initials() }}
      </span>
      <span *ngIf="status" [class]="'status-indicator status-' + status"></span>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }

    .avatar {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      overflow: hidden;
      background: var(--jira-neutral-300);
      color: var(--jira-neutral-0);
      font-weight: var(--font-weight-medium);
      flex-shrink: 0;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-initials {
      text-transform: uppercase;
      user-select: none;
    }

    /* Sizes */
    .avatar-xsmall {
      width: 20px;
      height: 20px;
      font-size: 10px;
    }

    .avatar-small {
      width: 24px;
      height: 24px;
      font-size: 11px;
    }

    .avatar-medium {
      width: 32px;
      height: 32px;
      font-size: 13px;
    }

    .avatar-large {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }

    .avatar-xlarge {
      width: 96px;
      height: 96px;
      font-size: 32px;
    }

    .avatar-square {
      border-radius: var(--radius-sm);
    }

    /* Status Indicator */
    .status-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid var(--jira-neutral-0);
    }

    .status-online {
      background: var(--jira-success);
    }

    .status-busy {
      background: var(--jira-danger);
    }

    .status-away {
      background: var(--jira-warning);
    }

    .status-offline {
      background: var(--jira-neutral-400);
    }
  `]
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() name = '';
  @Input() size: AvatarSize = 'medium';
  @Input() square = false;
  @Input() status?: 'online' | 'busy' | 'away' | 'offline';

  imageError = signal(false);

  initials = computed(() => {
    if (!this.name) return '?';

    const parts = this.name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return this.name.substring(0, 2);
  });

  avatarClasses = computed(() => {
    const classes = ['avatar', `avatar-${this.size}`];
    if (this.square) {
      classes.push('avatar-square');
    }
    return classes.join(' ');
  });

  onImageError(): void {
    this.imageError.set(true);
  }
}
