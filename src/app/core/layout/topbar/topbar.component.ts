import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    AvatarComponent,
    ButtonComponent
  ],
  template: `
    <header class="topbar">
      <!-- Left Section: Menu Toggle (Mobile) + Breadcrumbs -->
      <div class="topbar-left">
        <button class="menu-toggle" (click)="onToggleSidebar()">
          <jira-icon name="menu" [size]="20" />
        </button>

        <nav class="breadcrumbs">
          <span class="breadcrumb-item">Projects</span>
          <jira-icon name="chevron-right" [size]="16" class="breadcrumb-separator" />
          <span class="breadcrumb-item active">Dashboard</span>
        </nav>
      </div>

      <!-- Center Section: Search -->
      <div class="topbar-center">
        <div class="search-box">
          <jira-icon name="search" [size]="16" class="search-icon" />
          <input
            type="text"
            placeholder="Search issues, boards, people..."
            class="search-input"
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
          />
          <kbd class="search-kbd">⌘K</kbd>
        </div>
      </div>

      <!-- Right Section: Actions + User -->
      <div class="topbar-right">
        <!-- Create Button -->
        <jira-button variant="primary" size="medium" (clicked)="onCreate()">
          <jira-icon leftIcon name="plus" [size]="16" />
          Create
        </jira-button>

        <!-- Notifications -->
        <button class="icon-btn" [class.has-notification]="notificationCount() > 0" title="Notifications">
          <jira-icon name="notifications" [size]="20" />
          <span *ngIf="notificationCount() > 0" class="notification-badge">
            {{ notificationCount() > 9 ? '9+' : notificationCount() }}
          </span>
        </button>

        <!-- Dark Mode Toggle -->
        <button class="icon-btn" (click)="toggleTheme()" [title]="isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'">
          <jira-icon [name]="isDarkMode() ? 'sun' : 'moon'" [size]="20" />
        </button>

        <!-- Settings -->
        <button class="icon-btn" title="Settings">
          <jira-icon name="settings" [size]="20" />
        </button>

        <!-- User Menu -->
        <div class="user-menu" (click)="toggleUserMenu()">
          <jira-avatar
            *ngIf="currentUser()"
            [name]="currentUser()!.displayName || currentUser()!.username"
            [src]="currentUser()!.avatar"
            size="small"
            status="online"
          />
          <jira-icon name="chevron-down" [size]="16" />
        </div>

        <!-- User Dropdown (if menu open) -->
        <div *ngIf="userMenuOpen()" class="user-dropdown">
          <div class="dropdown-header">
            <jira-avatar
              *ngIf="currentUser()"
              [name]="currentUser()!.displayName || currentUser()!.username"
              [src]="currentUser()!.avatar"
              size="medium"
            />
            <div class="user-info">
              <div class="user-name">{{ currentUser()?.displayName || currentUser()?.username }}</div>
              <div class="user-email">{{ currentUser()?.email }}</div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <ul class="dropdown-menu">
            <li><a href="#" class="dropdown-item">Profile</a></li>
            <li><a href="#" class="dropdown-item">Account Settings</a></li>
            <li><a href="#" class="dropdown-item">Preferences</a></li>
          </ul>
          <div class="dropdown-divider"></div>
          <ul class="dropdown-menu">
            <li><a href="#" class="dropdown-item" (click)="onLogout($event)">Logout</a></li>
          </ul>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--topbar-height);
      padding: 0 var(--spacing-xl);
      background: var(--jira-neutral-0);
      border-bottom: 1px solid var(--jira-neutral-200);
      gap: var(--spacing-xl);
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
    }

    /* Left Section */
    .topbar-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      flex: 1;
      min-width: 0;
    }

    .menu-toggle {
      display: none;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-700);
      cursor: pointer;
      transition: background var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-100);
      }

      @media (max-width: 768px) {
        display: flex;
      }
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-sm);

      @media (max-width: 640px) {
        display: none;
      }
    }

    .breadcrumb-item {
      color: var(--jira-neutral-600);
      transition: color var(--transition-fast);

      &:hover:not(.active) {
        color: var(--jira-brand-primary);
        cursor: pointer;
      }

      &.active {
        color: var(--jira-neutral-1000);
        font-weight: var(--font-weight-medium);
      }
    }

    .breadcrumb-separator {
      color: var(--jira-neutral-400);
    }

    /* Center Section */
    .topbar-center {
      flex: 2;
      max-width: 600px;

      @media (max-width: 1024px) {
        flex: 1;
      }

      @media (max-width: 640px) {
        display: none;
      }
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 36px;
      background: var(--jira-neutral-100);
      border: 2px solid transparent;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);

      &:focus-within {
        background: var(--jira-neutral-0);
        border-color: var(--jira-brand-primary);
        box-shadow: 0 0 0 1px var(--jira-brand-primary);
      }
    }

    .search-icon {
      margin-left: var(--spacing-md);
      color: var(--jira-neutral-600);
    }

    .search-input {
      flex: 1;
      height: 100%;
      padding: 0 var(--spacing-md);
      background: transparent;
      border: none;
      outline: none;
      font-family: var(--font-family);
      font-size: var(--font-size-md);
      color: var(--jira-neutral-1000);

      &::placeholder {
        color: var(--jira-neutral-500);
      }
    }

    .search-kbd {
      margin-right: var(--spacing-md);
      padding: 2px 6px;
      background: var(--jira-neutral-200);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
      font-family: monospace;
    }

    /* Right Section */
    .topbar-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex: 1;
      justify-content: flex-end;
      position: relative;
    }

    .icon-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-700);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-100);
        color: var(--jira-neutral-1000);
      }
    }

    .notification-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--jira-danger);
      color: white;
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      border-radius: 8px;
      border: 2px solid var(--jira-neutral-0);
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-100);
      }
    }

    /* User Dropdown */
    .user-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 280px;
      background: var(--jira-neutral-0);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-dropdown);
      animation: fadeIn var(--transition-fast);
    }

    .dropdown-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
      color: var(--jira-neutral-1000);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-email {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--jira-neutral-200);
      margin: 0;
    }

    .dropdown-menu {
      list-style: none;
      padding: var(--spacing-xs);
      margin: 0;
    }

    .dropdown-item {
      display: block;
      padding: var(--spacing-sm) var(--spacing-md);
      color: var(--jira-neutral-800);
      text-decoration: none;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      cursor: pointer;

      &:hover {
        background: var(--jira-neutral-100);
        color: var(--jira-neutral-1000);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser;
  notificationCount = signal(3);
  userMenuOpen = signal(false);
  searchQuery = '';

  constructor(
    private authService: AuthService,
    public themeService: ThemeService
  ) {
    this.currentUser = this.authService.currentUser;
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(open => !open);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  onCreate(): void {
    console.log('Create new issue');
  }

  onSearch(): void {
    console.log('Search:', this.searchQuery);
  }

  onLogout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.userMenuOpen.set(false);
  }
}
