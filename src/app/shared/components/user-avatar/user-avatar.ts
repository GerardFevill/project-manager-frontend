import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User, getUserInitials, getUserFullName } from '../../../core/models';

/**
 * User Avatar Component - Jira style
 * Displays user avatar with initials or image
 */
@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  template: `
    <div
      class="user-avatar"
      [class.small]="size === 'small'"
      [class.medium]="size === 'medium'"
      [class.large]="size === 'large'"
      [style.background-color]="getAvatarColor()"
      [matTooltip]="user ? getUserFullName(user) : 'Unassigned'"
      matTooltipPosition="above">
      @if (user && user.avatarUrl) {
        <img [src]="user.avatarUrl" [alt]="user ? getUserFullName(user) : ''" class="avatar-image" />
      } @else if (user) {
        <span class="avatar-initials">{{ getUserInitials(user) }}</span>
      } @else {
        <span class="avatar-unassigned">?</span>
      }
    </div>
  `,
  styles: [`
    .user-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 500;
      color: white;
      flex-shrink: 0;
      position: relative;
      cursor: default;
      user-select: none;

      &.small {
        width: 24px;
        height: 24px;
        font-size: 10px;
      }

      &.medium {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }

      &.large {
        width: 40px;
        height: 40px;
        font-size: 14px;
      }

      .avatar-image {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      .avatar-initials {
        text-transform: uppercase;
      }

      .avatar-unassigned {
        opacity: 0.6;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAvatarComponent {
  @Input() user: User | null = null;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  getUserInitials(user: User): string {
    return getUserInitials(user);
  }

  getUserFullName(user: User): string {
    return getUserFullName(user);
  }

  /**
   * Generate a consistent color for user based on their ID
   */
  getAvatarColor(): string {
    if (!this.user) {
      return '#97a0af'; // Gray for unassigned
    }

    // Jira-style avatar colors
    const colors = [
      '#6554C0', // Purple
      '#00875A', // Green
      '#0052CC', // Blue
      '#DE350B', // Red
      '#FF8B00', // Orange
      '#00B8D9', // Cyan
      '#253858', // Dark Blue
      '#403294', // Deep Purple
    ];

    // Use user ID to generate consistent color
    const hash = this.user.id.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  }
}
