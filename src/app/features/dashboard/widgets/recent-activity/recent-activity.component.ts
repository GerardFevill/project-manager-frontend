import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: Date;
  type: 'created' | 'updated' | 'commented' | 'completed';
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, CardComponent, IconComponent, AvatarComponent],
  template: `
    <jira-card [hasHeader]="true">
      <div header class="widget-header">
        <h3>Recent Activity</h3>
      </div>

      <div class="activity-feed">
        <div *ngFor="let activity of activities()" class="activity-item">
          <jira-avatar
            [name]="activity.user.name"
            [src]="activity.user.avatar"
            size="small"
          />

          <div class="activity-content">
            <div class="activity-text">
              <strong>{{ activity.user.name }}</strong>
              <span> {{ activity.action }} </span>
              <span class="activity-target">{{ activity.target }}</span>
            </div>
            <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
          </div>

          <div class="activity-icon" [class]="'type-' + activity.type">
            <jira-icon [name]="getActivityIcon(activity.type)" [size]="14" />
          </div>
        </div>

        <div *ngIf="activities().length === 0" class="empty-state">
          <jira-icon name="info" [size]="48" color="var(--jira-neutral-400)" />
          <p>No recent activity</p>
        </div>
      </div>
    </jira-card>
  `,
  styles: [`
    .widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
    }

    .activity-feed {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .activity-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      transition: background var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-50);
      }
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-text {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-800);
      margin-bottom: 2px;

      strong {
        font-weight: var(--font-weight-semibold);
        color: var(--jira-neutral-1000);
      }
    }

    .activity-target {
      color: var(--jira-brand-primary);
      font-weight: var(--font-weight-medium);
    }

    .activity-time {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
    }

    .activity-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      flex-shrink: 0;

      &.type-created {
        background: #E3FCEF;
        color: var(--jira-success);
      }

      &.type-updated {
        background: #DEEBFF;
        color: var(--jira-info);
      }

      &.type-commented {
        background: #EAE6FF;
        color: #6554C0;
      }

      &.type-completed {
        background: #E3FCEF;
        color: var(--jira-success);
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl) var(--spacing-xl);
      text-align: center;

      p {
        margin-top: var(--spacing-md);
        color: var(--jira-neutral-600);
      }
    }
  `]
})
export class RecentActivityComponent implements OnInit {
  activities = signal<Activity[]>([
    {
      id: '1',
      user: { name: 'John Doe' },
      action: 'created',
      target: 'PROJ-127',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: 'created'
    },
    {
      id: '2',
      user: { name: 'Jane Smith' },
      action: 'commented on',
      target: 'PROJ-123',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      type: 'commented'
    },
    {
      id: '3',
      user: { name: 'Bob Wilson' },
      action: 'completed',
      target: 'PROJ-120',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: 'completed'
    },
    {
      id: '4',
      user: { name: 'Alice Johnson' },
      action: 'updated',
      target: 'PROJ-124',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      type: 'updated'
    },
    {
      id: '5',
      user: { name: 'Mike Brown' },
      action: 'created',
      target: 'PROJ-128',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      type: 'created'
    }
  ]);

  ngOnInit(): void {
    // TODO: Load real activities from API
  }

  getActivityIcon(type: string): 'plus' | 'edit' | 'comment' | 'check' | 'info' {
    const icons: Record<string, 'plus' | 'edit' | 'comment' | 'check' | 'info'> = {
      created: 'plus',
      updated: 'edit',
      commented: 'comment',
      completed: 'check'
    };
    return icons[type] || 'info';
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  }
}
