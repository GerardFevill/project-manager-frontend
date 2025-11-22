import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { CreateUserDto, UpdateUserDto } from '../../../core/services/user.service';

export interface UserFormData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="dialog-overlay" (click)="close()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>{{ isEditMode ? 'Edit User' : 'Create User' }}</h2>
          <button class="close-btn" (click)="close()">
            <jira-icon name="close" [size]="16" />
          </button>
        </div>

        <div class="dialog-body">
          <form #userForm="ngForm">
            <!-- First Name -->
            <div class="form-group">
              <label>First Name</label>
              <input
                type="text"
                [(ngModel)]="formData.firstName"
                name="firstName"
                placeholder="John"
                class="form-input"
                maxlength="255"
                #firstNameInput="ngModel"
              />
            </div>

            <!-- Last Name -->
            <div class="form-group">
              <label>Last Name</label>
              <input
                type="text"
                [(ngModel)]="formData.lastName"
                name="lastName"
                placeholder="Doe"
                class="form-input"
                maxlength="255"
                #lastNameInput="ngModel"
              />
            </div>

            <!-- Username -->
            <div class="form-group">
              <label class="required">Username</label>
              <input
                type="text"
                [(ngModel)]="formData.username"
                name="username"
                placeholder="john.doe"
                class="form-input"
                required
                minlength="3"
                maxlength="255"
                #usernameInput="ngModel"
              />
              <span class="error" *ngIf="usernameInput.invalid && usernameInput.touched">
                Username is required (3-255 characters)
              </span>
            </div>

            <!-- Password (only in create mode) -->
            <div class="form-group" *ngIf="!isEditMode">
              <label class="required">Password</label>
              <input
                type="password"
                [(ngModel)]="formData.password"
                name="password"
                placeholder="Enter password"
                class="form-input"
                required
                minlength="8"
                #passwordInput="ngModel"
              />
              <span class="error" *ngIf="passwordInput?.invalid && passwordInput?.touched">
                Password is required (minimum 8 characters)
              </span>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label class="required">Email</label>
              <input
                type="email"
                [(ngModel)]="formData.email"
                name="email"
                placeholder="john.doe@example.com"
                class="form-input"
                required
                email
                maxlength="500"
                #emailInput="ngModel"
              />
              <span class="error" *ngIf="emailInput.invalid && emailInput.touched">
                <span *ngIf="emailInput.errors?.['required']">Email is required</span>
                <span *ngIf="emailInput.errors?.['email']">Please enter a valid email</span>
                <span *ngIf="emailInput.errors?.['maxlength']">Email must be less than 500 characters</span>
              </span>
            </div>

            <!-- Active (only in edit mode) -->
            <div class="form-group" *ngIf="isEditMode">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  [(ngModel)]="formData.isActive"
                  name="isActive"
                />
                <span>Active user</span>
              </label>
              <span class="hint">Inactive users cannot log in</span>
            </div>
          </form>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-subtle" (click)="close()">Cancel</button>
          <button
            class="btn btn-primary"
            (click)="submitForm()"
            [disabled]="!isFormValid() || submitting"
          >
            {{ submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create User') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog { background: var(--jira-neutral-0); border-radius: var(--radius-lg); width: 500px; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-lg); border-bottom: 1px solid var(--jira-neutral-200); }
    .dialog-header h2 { margin: 0; font-size: var(--font-size-lg); }
    .close-btn { border: none; background: transparent; cursor: pointer; padding: var(--spacing-xs); }
    .dialog-body { padding: var(--spacing-lg); overflow-y: auto; flex: 1; }
    .form-group { display: flex; flex-direction: column; gap: var(--spacing-xs); margin-bottom: var(--spacing-md); }
    .form-group label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--jira-neutral-800); }
    .form-group label.required::after { content: ' *'; color: var(--jira-danger); }
    .form-input { padding: var(--spacing-sm); border: 1px solid var(--jira-neutral-300); border-radius: var(--radius-sm); font-size: var(--font-size-sm); font-family: inherit; background: var(--jira-neutral-0); color: var(--jira-neutral-1000); }
    .form-input:focus { outline: none; border-color: var(--jira-brand-primary); }
    .form-input.ng-invalid.ng-touched { border-color: var(--jira-danger); }
    .error { font-size: var(--font-size-xs); color: var(--jira-danger); }
    .hint { font-size: var(--font-size-xs); color: var(--jira-neutral-600); }

    .role-selector { display: flex; flex-direction: column; gap: var(--spacing-xs); }
    .role-option { display: flex; align-items: center; padding: var(--spacing-md); border: 2px solid var(--jira-neutral-300); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; }
    .role-option input[type="radio"] { display: none; }
    .role-option:hover { border-color: var(--jira-brand-primary); background: var(--jira-neutral-50); }
    .role-option.selected { border-color: var(--jira-brand-primary); background: var(--jira-info-bg); }
    .role-content { display: flex; align-items: center; gap: var(--spacing-md); width: 100%; }
    .role-info { display: flex; flex-direction: column; gap: 4px; }
    .role-name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--jira-neutral-900); }
    .role-desc { font-size: var(--font-size-xs); color: var(--jira-neutral-600); }

    .checkbox-label { display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer; }
    .checkbox-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }

    .dialog-footer { display: flex; justify-content: flex-end; gap: var(--spacing-sm); padding: var(--spacing-lg); border-top: 1px solid var(--jira-neutral-200); }
    .btn { padding: var(--spacing-xs) var(--spacing-md); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); }
    .btn-primary { background: var(--jira-brand-primary); color: var(--jira-neutral-0); }
    .btn-primary:hover:not(:disabled) { background: var(--jira-brand-primary-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-subtle { background: transparent; color: var(--jira-neutral-700); }
    .btn-subtle:hover { background: var(--jira-neutral-100); }
  `]
})
export class UserFormDialogComponent implements OnInit {
  @Input() user?: any; // For edit mode
  @Output() submit = new EventEmitter<CreateUserDto | UpdateUserDto>();
  @Output() cancel = new EventEmitter<void>();

  submitting = false;
  isEditMode = false;

  formData: UserFormData = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isActive: true
  };

  ngOnInit(): void {
    // Reset submitting flag
    this.submitting = false;

    if (this.user) {
      this.isEditMode = true;
      this.formData = {
        username: this.user.username || '',
        email: this.user.email || '',
        password: '', // Never pre-fill password
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        isActive: this.user.isActive ?? true
      };
    } else {
      // Reset form for create mode
      this.isEditMode = false;
      this.formData = {
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        isActive: true
      };
    }
  }

  isFormValid(): boolean {
    const usernameValid = this.formData.username.trim().length >= 3 &&
                         this.formData.username.trim().length <= 255;
    const emailValid = this.formData.email.trim().length > 0 &&
                      this.isValidEmail(this.formData.email.trim()) &&
                      this.formData.email.trim().length <= 500;

    // In create mode, password is required
    if (!this.isEditMode) {
      return usernameValid && emailValid && this.formData.password.trim().length >= 8;
    }

    return usernameValid && emailValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  submitForm(): void {
    if (!this.isFormValid() || this.submitting) return;

    this.submitting = true;

    if (this.isEditMode) {
      // For update, only send changed fields
      const dto: UpdateUserDto = {};
      if (this.formData.username.trim()) dto.username = this.formData.username.trim();
      if (this.formData.email.trim()) dto.email = this.formData.email.trim();
      if (this.formData.firstName.trim()) dto.firstName = this.formData.firstName.trim();
      if (this.formData.lastName.trim()) dto.lastName = this.formData.lastName.trim();
      dto.isActive = this.formData.isActive;
      this.submit.emit(dto);
    } else {
      // For create, send required fields
      const dto: CreateUserDto = {
        username: this.formData.username.trim(),
        email: this.formData.email.trim(),
        password: this.formData.password.trim(),
        firstName: this.formData.firstName.trim() || undefined,
        lastName: this.formData.lastName.trim() || undefined
      };
      this.submit.emit(dto);
    }
  }

  close(): void {
    this.submitting = false;
    this.cancel.emit();
  }
}
