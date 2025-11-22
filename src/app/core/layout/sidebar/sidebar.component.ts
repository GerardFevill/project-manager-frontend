import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';

interface MenuItem {
  id: string;
  label: string;
  icon: 'dashboard' | 'kanban' | 'backlog' | 'sprint' | 'zap' | 'reports' | 'settings' | 'folder' | 'user';
  route: string;
  badge?: number;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, AvatarComponent],
  template: `
    <aside [class]="sidebarClasses">
      <!-- Logo & Project Selector -->
      <div class="sidebar-header">
        <div class="logo" [class.collapsed]="collapsed">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill="url(#gradient)"/>
            <path d="M16 8v16M8 16h16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stop-color="#0052CC"/>
                <stop offset="100%" stop-color="#2684FF"/>
              </linearGradient>
            </defs>
          </svg>
          <span *ngIf="!collapsed" class="logo-text">Jira Manager</span>
        </div>

        <div class="project-selector" *ngIf="!collapsed && currentProject()">
          <div class="project-info">
            <jira-avatar
              [name]="currentProject()!.name"
              [src]="currentProject()!.avatar"
              size="small"
              [square]="true"
            />
            <div class="project-details">
              <div class="project-name">{{ currentProject()!.name }}</div>
              <div class="project-key">{{ currentProject()!.key }}</div>
            </div>
          </div>
          <jira-icon name="chevron-down" [size]="16" />
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <div *ngFor="let section of menuSections; let isLast = last">
          <!-- Section Title -->
          <div *ngIf="section.title && !collapsed" class="section-title">
            {{ section.title }}
          </div>

          <!-- Section Items -->
          <ul class="nav-list">
            <li
              *ngFor="let item of section.items"
              class="nav-item"
              [class.active]="isActive(item.route)"
              [title]="collapsed ? item.label : ''"
            >
              <a [routerLink]="item.route" class="nav-link">
                <jira-icon [name]="item.icon" [size]="20" />
                <span *ngIf="!collapsed" class="nav-label">{{ item.label }}</span>
                <span *ngIf="item.badge && !collapsed" class="nav-badge">{{ item.badge }}</span>
              </a>
            </li>
          </ul>

          <!-- Divider -->
          <div *ngIf="!isLast" class="nav-divider"></div>
        </div>
      </nav>

      <!-- User Profile (Bottom) -->
      <div class="sidebar-footer">
        <div class="user-profile" *ngIf="currentUser()">
          <jira-avatar
            [name]="currentUser()!.displayName || currentUser()!.username"
            [src]="currentUser()!.avatar"
            size="small"
            status="online"
          />
          <div *ngIf="!collapsed" class="user-info">
            <div class="user-name">{{ currentUser()!.displayName || currentUser()!.username }}</div>
            <div class="user-email">{{ currentUser()!.email }}</div>
          </div>
        </div>

        <button
          class="collapse-btn"
          (click)="onToggleCollapse()"
          [title]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <jira-icon
            [name]="collapsed ? 'chevron-right' : 'chevron-left'"
            [size]="16"
          />
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      display: flex;
      flex-direction: column;
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--jira-neutral-0);
      border-right: 1px solid var(--jira-neutral-200);
      transition: width var(--transition-normal);
      flex-shrink: 0;
    }

    .sidebar-collapsed {
      width: var(--sidebar-collapsed-width);
    }

    /* Header */
    .sidebar-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--jira-neutral-200);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);

      &.collapsed {
        justify-content: center;
      }
    }

    .logo-text {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--jira-neutral-1000);
    }

    .project-selector {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-100);
      }
    }

    .project-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 1;
      min-width: 0;
    }

    .project-details {
      flex: 1;
      min-width: 0;
    }

    .project-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--jira-neutral-1000);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .project-key {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: var(--spacing-md) 0;
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .section-title {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-600);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: var(--spacing-md) var(--spacing-lg);
      margin-top: var(--spacing-sm);
    }

    .nav-divider {
      height: 1px;
      background: var(--jira-neutral-200);
      margin: var(--spacing-md) var(--spacing-lg);
    }

    .nav-item {
      margin: 0 var(--spacing-sm);
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-700);
      text-decoration: none;
      transition: all var(--transition-fast);
      cursor: pointer;

      &:hover {
        background: var(--jira-neutral-100);
        color: var(--jira-neutral-1000);
      }

      .sidebar-collapsed & {
        justify-content: center;
        padding: var(--spacing-sm);
      }
    }

    .nav-item.active .nav-link {
      background: var(--jira-info-bg);
      color: var(--jira-brand-primary);
      font-weight: var(--font-weight-medium);
    }

    .nav-label {
      flex: 1;
      font-size: var(--font-size-md);
    }

    .nav-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      background: var(--jira-danger);
      color: white;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      border-radius: 10px;
    }

    /* Footer */
    .sidebar-footer {
      padding: var(--spacing-lg);
      border-top: 1px solid var(--jira-neutral-200);
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-100);
      }

      .sidebar-collapsed & {
        justify-content: center;
      }
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--jira-neutral-1000);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-email {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .collapse-btn {
      width: 100%;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid var(--jira-neutral-300);
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-700);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-100);
        border-color: var(--jira-neutral-400);
      }
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  currentUser;
  currentProject;

  menuSections: MenuSection[] = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { id: 'kanban', label: 'Kanban Board', icon: 'kanban', route: '/kanban' },
        { id: 'backlog', label: 'Backlog', icon: 'backlog', route: '/backlog' },
        { id: 'sprints', label: 'Sprints', icon: 'sprint', route: '/sprints' },
        { id: 'epics', label: 'Epics', icon: 'zap', route: '/epics' },
        { id: 'reports', label: 'Reports', icon: 'reports', route: '/reports' },
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'projects', label: 'Projects', icon: 'folder', route: '/projects' },
        { id: 'users', label: 'Users', icon: 'user', route: '/users' },
      ]
    },
    {
      items: [
        { id: 'settings', label: 'Settings', icon: 'settings', route: '/settings' },
      ]
    }
  ];

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUser;
    this.currentProject = this.projectService.currentProject;
  }

  get sidebarClasses(): string {
    return `sidebar ${this.collapsed ? 'sidebar-collapsed' : ''}`;
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }
}
