import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { User } from '../../../core/services/issue.service';

@Component({
  selector: 'app-user-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, AvatarComponent],
  template: `
    <div class="user-picker">
      <div class="selected-user" (click)="toggleDropdown()">
        <div class="user-display" *ngIf="selectedUser(); else unassigned">
          <jira-avatar
            [name]="getUserDisplayName(selectedUser()!)"
            [src]="selectedUser()!.avatar"
            size="small"
          />
          <span class="user-name">{{ getUserDisplayName(selectedUser()!) }}</span>
        </div>
        <ng-template #unassigned>
          <div class="unassigned">
            <jira-icon name="user" [size]="16" />
            <span>{{ placeholder }}</span>
          </div>
        </ng-template>
        <jira-icon
          [name]="isOpen() ? 'chevron-up' : 'chevron-down'"
          [size]="14"
          class="dropdown-icon"
        />
      </div>

      <div class="dropdown" *ngIf="isOpen()">
        <div class="search-box">
          <jira-icon name="search" [size]="14" />
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Search users..."
            class="search-input"
            #searchInput
          />
        </div>

        <div class="user-list">
          <button
            type="button"
            class="user-option"
            [class.selected]="!selectedUserId"
            (click)="selectUser(null)"
          >
            <jira-icon name="user" [size]="16" />
            <span>Unassigned</span>
          </button>

          <button
            *ngFor="let user of filteredUsers()"
            type="button"
            class="user-option"
            [class.selected]="selectedUserId === user.id"
            (click)="selectUser(user.id)"
          >
            <jira-avatar
              [name]="getUserDisplayName(user)"
              [src]="user.avatar"
              size="small"
            />
            <div class="user-info">
              <span class="user-name">{{ getUserDisplayName(user) }}</span>
              <span class="user-email">{{ user.email }}</span>
            </div>
          </button>

          <div class="empty-state" *ngIf="filteredUsers().length === 0">
            <jira-icon name="search" [size]="32" color="var(--jira-neutral-400)" />
            <span>No users found</span>
          </div>
        </div>
      </div>
    </div>

    <div class="overlay" *ngIf="isOpen()" (click)="closeDropdown()"></div>
  `,
  styles: [`
    .user-picker { position: relative; width: 100%; }
    .selected-user { display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-sm); border: 1px solid var(--jira-neutral-300); border-radius: var(--radius-sm); background: white; cursor: pointer; transition: all 0.2s; }
    .selected-user:hover { border-color: var(--jira-brand-primary); }
    .user-display { display: flex; align-items: center; gap: var(--spacing-sm); }
    .unassigned { display: flex; align-items: center; gap: var(--spacing-sm); color: var(--jira-neutral-600); }
    .user-name { font-size: var(--font-size-sm); }
    .dropdown-icon { color: var(--jira-neutral-600); }

    .dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: white; border: 1px solid var(--jira-neutral-300); border-radius: var(--radius-md); box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1001; max-height: 300px; display: flex; flex-direction: column; }
    .search-box { display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-sm); border-bottom: 1px solid var(--jira-neutral-200); }
    .search-input { flex: 1; border: none; outline: none; font-size: var(--font-size-sm); }
    .user-list { overflow-y: auto; max-height: 240px; }
    .user-option { display: flex; align-items: center; gap: var(--spacing-sm); width: 100%; padding: var(--spacing-sm); border: none; background: transparent; text-align: left; cursor: pointer; transition: background 0.2s; }
    .user-option:hover { background: var(--jira-neutral-100); }
    .user-option.selected { background: var(--jira-brand-bg); }
    .user-info { display: flex; flex-direction: column; }
    .user-info .user-name { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); }
    .user-email { font-size: var(--font-size-xs); color: var(--jira-neutral-600); }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--spacing-2xl); gap: var(--spacing-sm); color: var(--jira-neutral-600); }
    .overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; }
  `]
})
export class UserPickerComponent {
  @Input() users: User[] = [];
  @Input() selectedUserId: string | null = null;
  @Input() placeholder = 'Select user';
  @Output() userSelected = new EventEmitter<string | null>();

  isOpen = signal(false);
  searchQuery = signal('');

  selectedUser = computed(() => {
    if (!this.selectedUserId) return null;
    return this.users.find(u => u.id === this.selectedUserId) || null;
  });

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.users;
    return this.users.filter(user =>
      this.getUserDisplayName(user).toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query)
    );
  });

  toggleDropdown(): void {
    this.isOpen.update(open => !open);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  selectUser(userId: string | null): void {
    this.userSelected.emit(userId);
    this.closeDropdown();
  }

  onSearchChange(): void {
    // Trigger computed signal update
  }
  getUserDisplayName(user: any): string {
    if (!user) return 'Unknown';
    if (user.displayName) return user.displayName;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.username || user.email;
  }
}
