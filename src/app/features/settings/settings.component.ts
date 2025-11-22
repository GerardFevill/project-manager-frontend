import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { AuthService, AuthUser } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';

type SettingsTab = 'profile' | 'preferences' | 'notifications' | 'security';

interface NotificationSettings {
  emailNotifications: boolean;
  issueAssigned: boolean;
  issueUpdated: boolean;
  commentMentioned: boolean;
  sprintStarted: boolean;
  sprintCompleted: boolean;
}

interface PreferenceSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  startPage: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    AvatarComponent
  ],
  template: `
    <div class="settings-page">
      <div class="settings-header">
        <h1>Settings</h1>
        <p class="subtitle">Manage your account settings and preferences</p>
      </div>

      <div class="settings-container">
        <!-- Sidebar Tabs -->
        <div class="settings-sidebar">
          <button
            class="tab-button"
            [class.active]="activeTab() === 'profile'"
            (click)="activeTab.set('profile')"
          >
            <jira-icon name="user" [size]="16" />
            <span>Profile</span>
          </button>
          <button
            class="tab-button"
            [class.active]="activeTab() === 'preferences'"
            (click)="activeTab.set('preferences')"
          >
            <jira-icon name="cog" [size]="16" />
            <span>Preferences</span>
          </button>
          <button
            class="tab-button"
            [class.active]="activeTab() === 'notifications'"
            (click)="activeTab.set('notifications')"
          >
            <jira-icon name="bell" [size]="16" />
            <span>Notifications</span>
          </button>
          <button
            class="tab-button"
            [class.active]="activeTab() === 'security'"
            (click)="activeTab.set('security')"
          >
            <jira-icon name="shield" [size]="16" />
            <span>Security</span>
          </button>
        </div>

        <!-- Content Area -->
        <div class="settings-content">
          <!-- Profile Tab -->
          <div *ngIf="activeTab() === 'profile'" class="tab-content">
            <div class="section-header">
              <h2>Profile Information</h2>
              <p>Update your personal information and avatar</p>
            </div>

            <div class="settings-card">
              <div class="avatar-section">
                <jira-avatar
                  [name]="currentUser()?.displayName || 'User'"
                  [src]="currentUser()?.avatar"
                  size="xlarge"
                />
                <div class="avatar-info">
                  <h3>{{ currentUser()?.displayName }}</h3>
                  <p>{{ currentUser()?.email }}</p>
                  <jira-badge [variant]="currentUser()?.isAdmin ? 'danger' : 'default'">
                    {{ currentUser()?.isAdmin ? 'Administrator' : 'User' }}
                  </jira-badge>
                </div>
              </div>

              <form class="settings-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      class="form-input"
                      [value]="currentUser()?.username"
                      disabled
                    />
                    <span class="hint">Username cannot be changed</span>
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      class="form-input"
                      [value]="currentUser()?.email"
                      disabled
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      class="form-input"
                      [(ngModel)]="profileForm.firstName"
                      name="firstName"
                      placeholder="John"
                    />
                  </div>
                  <div class="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      class="form-input"
                      [(ngModel)]="profileForm.lastName"
                      name="lastName"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Avatar URL</label>
                  <input
                    type="url"
                    class="form-input"
                    [(ngModel)]="profileForm.avatar"
                    name="avatar"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div class="form-actions">
                  <jira-button variant="primary" (clicked)="saveProfile()">
                    <jira-icon leftIcon name="check" [size]="16" />
                    Save Changes
                  </jira-button>
                </div>
              </form>
            </div>
          </div>

          <!-- Preferences Tab -->
          <div *ngIf="activeTab() === 'preferences'" class="tab-content">
            <div class="section-header">
              <h2>Preferences</h2>
              <p>Customize your experience</p>
            </div>

            <div class="settings-card">
              <form class="settings-form">
                <div class="form-group">
                  <label>Theme</label>
                  <div class="theme-selector">
                    <button
                      type="button"
                      class="theme-option"
                      [class.selected]="currentTheme() === 'light'"
                      (click)="setTheme('light')"
                    >
                      <jira-icon name="sun" [size]="20" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      class="theme-option"
                      [class.selected]="currentTheme() === 'dark'"
                      (click)="setTheme('dark')"
                    >
                      <jira-icon name="moon" [size]="20" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label>Language</label>
                  <select
                    class="form-select"
                    [(ngModel)]="preferences.language"
                    name="language"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Timezone</label>
                  <select
                    class="form-select"
                    [(ngModel)]="preferences.timezone"
                    name="timezone"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Date Format</label>
                  <select
                    class="form-select"
                    [(ngModel)]="preferences.dateFormat"
                    name="dateFormat"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Start Page</label>
                  <select
                    class="form-select"
                    [(ngModel)]="preferences.startPage"
                    name="startPage"
                  >
                    <option value="dashboard">Dashboard</option>
                    <option value="kanban">Kanban Board</option>
                    <option value="backlog">Backlog</option>
                    <option value="sprints">Sprints</option>
                  </select>
                  <span class="hint">Choose which page to show when you log in</span>
                </div>

                <div class="form-actions">
                  <jira-button variant="primary" (clicked)="savePreferences()">
                    <jira-icon leftIcon name="check" [size]="16" />
                    Save Preferences
                  </jira-button>
                </div>
              </form>
            </div>
          </div>

          <!-- Notifications Tab -->
          <div *ngIf="activeTab() === 'notifications'" class="tab-content">
            <div class="section-header">
              <h2>Notification Settings</h2>
              <p>Choose what notifications you want to receive</p>
            </div>

            <div class="settings-card">
              <form class="settings-form">
                <div class="notification-section">
                  <div class="section-title">
                    <jira-icon name="envelope" [size]="16" />
                    <span>Email Notifications</span>
                  </div>

                  <label class="checkbox-item">
                    <input
                      type="checkbox"
                      [(ngModel)]="notifications.emailNotifications"
                      name="emailNotifications"
                    />
                    <div class="checkbox-content">
                      <span class="checkbox-label">Enable email notifications</span>
                      <span class="checkbox-hint">Receive notifications via email</span>
                    </div>
                  </label>
                </div>

                <div class="notification-section" [class.disabled]="!notifications.emailNotifications">
                  <div class="section-title">
                    <jira-icon name="list" [size]="16" />
                    <span>Issue Notifications</span>
                  </div>

                  <label class="checkbox-item">
                    <input
                      type="checkbox"
                      [(ngModel)]="notifications.issueAssigned"
                      name="issueAssigned"
                      [disabled]="!notifications.emailNotifications"
                    />
                    <div class="checkbox-content">
                      <span class="checkbox-label">Issue assigned to me</span>
                      <span class="checkbox-hint">Get notified when an issue is assigned to you</span>
                    </div>
                  </label>

                  <label class="checkbox-item">
                    <input
                      type="checkbox"
                      [(ngModel)]="notifications.issueUpdated"
                      name="issueUpdated"
                      [disabled]="!notifications.emailNotifications"
                    />
                    <div class="checkbox-content">
                      <span class="checkbox-label">Issue updates</span>
                      <span class="checkbox-hint">Get notified when issues you're watching are updated</span>
                    </div>
                  </label>

                  <label class="checkbox-item">
                    <input
                      type="checkbox"
                      [(ngModel)]="notifications.commentMentioned"
                      name="commentMentioned"
                      [disabled]="!notifications.emailNotifications"
                    />
                    <div class="checkbox-content">
                      <span class="checkbox-label">Mentioned in comments</span>
                      <span class="checkbox-hint">Get notified when someone mentions you in a comment</span>
                    </div>
                  </label>
                </div>

                <div class="notification-section" [class.disabled]="!notifications.emailNotifications">
                  <div class="section-title">
                    <jira-icon name="calendar" [size]="16" />
                    <span>Sprint Notifications</span>
                  </div>

                  <label class="checkbox-item">
                    <input
                      type="checkbox"
                      [(ngModel)]="notifications.sprintStarted"
                      name="sprintStarted"
                      [disabled]="!notifications.emailNotifications"
                    />
                    <div class="checkbox-content">
                      <span class="checkbox-label">Sprint started</span>
                      <span class="checkbox-hint">Get notified when a sprint starts</span>
                    </div>
                  </label>

                  <label class="checkbox-item">
                    <input
                      type="checkbox"
                      [(ngModel)]="notifications.sprintCompleted"
                      name="sprintCompleted"
                      [disabled]="!notifications.emailNotifications"
                    />
                    <div class="checkbox-content">
                      <span class="checkbox-label">Sprint completed</span>
                      <span class="checkbox-hint">Get notified when a sprint is completed</span>
                    </div>
                  </label>
                </div>

                <div class="form-actions">
                  <jira-button variant="primary" (clicked)="saveNotifications()">
                    <jira-icon leftIcon name="check" [size]="16" />
                    Save Notification Settings
                  </jira-button>
                </div>
              </form>
            </div>
          </div>

          <!-- Security Tab -->
          <div *ngIf="activeTab() === 'security'" class="tab-content">
            <div class="section-header">
              <h2>Security</h2>
              <p>Manage your account security</p>
            </div>

            <div class="settings-card">
              <div class="security-section">
                <div class="section-title">
                  <jira-icon name="lock" [size]="16" />
                  <span>Change Password</span>
                </div>

                <form class="settings-form">
                  <div class="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      class="form-input"
                      [(ngModel)]="passwordForm.currentPassword"
                      name="currentPassword"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div class="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      class="form-input"
                      [(ngModel)]="passwordForm.newPassword"
                      name="newPassword"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div class="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      class="form-input"
                      [(ngModel)]="passwordForm.confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div class="form-actions">
                    <jira-button variant="primary" (clicked)="changePassword()">
                      <jira-icon leftIcon name="lock" [size]="16" />
                      Update Password
                    </jira-button>
                  </div>
                </form>
              </div>

              <div class="security-section">
                <div class="section-title">
                  <jira-icon name="info" [size]="16" />
                  <span>Account Information</span>
                </div>

                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">User ID</span>
                    <span class="info-value">{{ currentUser()?.id }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Account Type</span>
                    <span class="info-value">{{ currentUser()?.isAdmin ? 'Administrator' : 'Standard User' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ currentUser()?.email }}</span>
                  </div>
                </div>
              </div>

              <div class="security-section danger-zone">
                <div class="section-title">
                  <jira-icon name="warning" [size]="16" />
                  <span>Danger Zone</span>
                </div>

                <div class="danger-content">
                  <div class="danger-info">
                    <h4>Sign Out Everywhere</h4>
                    <p>Sign out from all devices and browsers</p>
                  </div>
                  <jira-button variant="danger" (clicked)="signOutEverywhere()">
                    Sign Out All Sessions
                  </jira-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      padding: var(--spacing-xl);
      max-width: 1200px;
      margin: 0 auto;
    }

    .settings-header {
      margin-bottom: var(--spacing-2xl);
    }

    h1 {
      margin: 0 0 var(--spacing-xs);
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-semibold);
    }

    .subtitle {
      margin: 0;
      color: var(--jira-neutral-600);
      font-size: var(--font-size-md);
    }

    .settings-container {
      display: flex;
      gap: var(--spacing-xl);
    }

    /* Sidebar */
    .settings-sidebar {
      width: 200px;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .tab-button {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      border: none;
      background: var(--jira-neutral-0);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-700);
      font-weight: var(--font-weight-medium);
      transition: all 0.2s;
      text-align: left;
    }

    .tab-button:hover {
      background: var(--jira-neutral-100);
    }

    .tab-button.active {
      background: var(--jira-brand-primary);
      color: var(--jira-neutral-0);
    }

    /* Content */
    .settings-content {
      flex: 1;
    }

    .tab-content {
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .section-header {
      margin-bottom: var(--spacing-xl);
    }

    .section-header h2 {
      margin: 0 0 var(--spacing-xs);
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
    }

    .section-header p {
      margin: 0;
      color: var(--jira-neutral-600);
      font-size: var(--font-size-sm);
    }

    .settings-card {
      background: var(--jira-neutral-0);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
    }

    /* Profile */
    .avatar-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding-bottom: var(--spacing-xl);
      margin-bottom: var(--spacing-xl);
      border-bottom: 1px solid var(--jira-neutral-200);
    }

    .avatar-info h3 {
      margin: 0 0 var(--spacing-xs);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
    }

    .avatar-info p {
      margin: 0 0 var(--spacing-sm);
      color: var(--jira-neutral-600);
      font-size: var(--font-size-sm);
    }

    /* Forms */
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .form-group label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-800);
    }

    .form-input, .form-select {
      padding: var(--spacing-sm);
      border: 1px solid var(--jira-neutral-300);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      font-family: inherit;
      background: var(--jira-neutral-0);
      color: var(--jira-neutral-1000);
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: var(--jira-brand-primary);
    }

    .form-input:disabled {
      background: var(--jira-neutral-100);
      cursor: not-allowed;
      color: var(--jira-neutral-600);
    }

    .hint {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
    }

    .form-actions {
      padding-top: var(--spacing-md);
    }

    /* Theme Selector */
    .theme-selector {
      display: flex;
      gap: var(--spacing-sm);
    }

    .theme-option {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border: 2px solid var(--jira-neutral-300);
      background: var(--jira-neutral-0);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s;
    }

    .theme-option:hover {
      border-color: var(--jira-brand-primary);
      background: var(--jira-neutral-50);
    }

    .theme-option.selected {
      border-color: var(--jira-brand-primary);
      background: var(--jira-info-bg);
    }

    /* Notifications */
    .notification-section {
      padding: var(--spacing-lg) 0;
      border-bottom: 1px solid var(--jira-neutral-200);
    }

    .notification-section:last-child {
      border-bottom: none;
    }

    .notification-section.disabled {
      opacity: 0.5;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-800);
    }

    .checkbox-item {
      display: flex;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background 0.2s;
    }

    .checkbox-item:hover {
      background: var(--jira-neutral-50);
    }

    .checkbox-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      margin-top: 2px;
    }

    .checkbox-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .checkbox-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--jira-neutral-900);
    }

    .checkbox-hint {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
    }

    /* Security */
    .security-section {
      padding: var(--spacing-lg) 0;
      border-bottom: 1px solid var(--jira-neutral-200);
    }

    .security-section:last-child {
      border-bottom: none;
    }

    .info-grid {
      display: grid;
      gap: var(--spacing-md);
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-sm);
      background: var(--jira-neutral-50);
      border-radius: var(--radius-sm);
    }

    .info-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-700);
    }

    .info-value {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-900);
      font-family: monospace;
    }

    .danger-zone {
      border: 2px solid var(--jira-danger);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      margin-top: var(--spacing-lg);
    }

    .danger-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-md);
    }

    .danger-info h4 {
      margin: 0 0 var(--spacing-xs);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-danger);
    }

    .danger-info p {
      margin: 0;
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .settings-container {
        flex-direction: column;
      }

      .settings-sidebar {
        width: 100%;
        flex-direction: row;
        overflow-x: auto;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .danger-content {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  activeTab = signal<SettingsTab>('profile');
  currentUser = computed(() => this.authService.currentUser());
  currentTheme = computed(() => this.themeService.currentTheme());

  profileForm = {
    firstName: '',
    lastName: '',
    avatar: ''
  };

  preferences: PreferenceSettings = {
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    startPage: 'dashboard'
  };

  notifications: NotificationSettings = {
    emailNotifications: true,
    issueAssigned: true,
    issueUpdated: true,
    commentMentioned: true,
    sprintStarted: false,
    sprintCompleted: false
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.firstName = user.firstName || '';
      this.profileForm.lastName = user.lastName || '';
      this.profileForm.avatar = user.avatar || '';
    }

    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('user_preferences');
    if (savedPreferences) {
      this.preferences = JSON.parse(savedPreferences);
    }

    const savedNotifications = localStorage.getItem('notification_settings');
    if (savedNotifications) {
      this.notifications = JSON.parse(savedNotifications);
    }
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.themeService.setTheme(theme);
    this.toastService.success('Theme updated', `Switched to ${theme} mode`);
  }

  saveProfile(): void {
    // In a real app, this would call an API
    this.toastService.success(
      'Profile updated',
      'Your profile information has been saved'
    );
  }

  savePreferences(): void {
    localStorage.setItem('user_preferences', JSON.stringify(this.preferences));
    this.toastService.success(
      'Preferences saved',
      'Your preferences have been updated'
    );
  }

  saveNotifications(): void {
    localStorage.setItem('notification_settings', JSON.stringify(this.notifications));
    this.toastService.success(
      'Notification settings saved',
      'Your notification preferences have been updated'
    );
  }

  changePassword(): void {
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) {
      this.toastService.error('Missing fields', 'Please fill in all password fields');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toastService.error('Passwords do not match', 'New password and confirmation must match');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.toastService.error('Password too short', 'Password must be at least 8 characters');
      return;
    }

    // In a real app, this would call an API
    this.toastService.success(
      'Password updated',
      'Your password has been changed successfully'
    );

    // Reset form
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  signOutEverywhere(): void {
    if (!confirm('Are you sure you want to sign out from all devices? You will need to log in again.')) {
      return;
    }

    // In a real app, this would call an API to invalidate all tokens
    this.authService.logout();
    this.toastService.success(
      'Signed out',
      'You have been signed out from all devices'
    );
  }
}
