import { Component, Input, Output, EventEmitter, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { CreateProjectDto, UpdateProjectDto } from '../../../core/services/project.service';
import { User, UserService } from '../../../core/services/user.service';
import { Subject, takeUntil } from 'rxjs';

export interface ProjectFormData {
  key: string;
  name: string;
  description?: string;
  leadId?: string;
  projectType?: string;
  avatar?: string;
}

@Component({
  selector: 'app-project-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="dialog-overlay" (click)="close()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>{{ isEditMode ? 'Edit Project' : 'Create Project' }}</h2>
          <button class="close-btn" (click)="close()">
            <jira-icon name="close" [size]="16" />
          </button>
        </div>

        <div class="dialog-body">
          <form #projectForm="ngForm">
            <!-- Project Key -->>
            <div class="form-group">
              <label class="required">Project Key</label>
              <input
                type="text"
                [(ngModel)]="formData.key"
                name="key"
                placeholder="PROJ"
                class="form-input"
                required
                maxlength="10"
                pattern="[A-Z]+"
                [disabled]="isEditMode"
                #keyInput="ngModel"
              />
              <span class="hint">Uppercase letters only (e.g., PROJ, DEV)</span>
              <span class="error" *ngIf="keyInput.invalid && keyInput.touched">
                Project key is required and must be uppercase letters
              </span>
            </div>

            <!-- Project Name -->
            <div class="form-group">
              <label class="required">Project Name</label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                name="name"
                placeholder="My Awesome Project"
                class="form-input"
                required
                #nameInput="ngModel"
              />
              <span class="error" *ngIf="nameInput.invalid && nameInput.touched">
                Project name is required
              </span>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label>Description</label>
              <textarea
                [(ngModel)]="formData.description"
                name="description"
                placeholder="Describe your project..."
                class="form-textarea"
                rows="4"
              ></textarea>
            </div>

            <!-- Project Type -->
            <div class="form-group">
              <label>Project Type</label>
              <div class="type-selector">
                <label class="type-option" [class.selected]="formData.projectType === 'software'">
                  <input type="radio" name="projectType" [(ngModel)]="formData.projectType" value="software" />
                  <div class="type-content">
                    <jira-icon name="code" [size]="20" />
                    <div class="type-info">
                      <span class="type-name">Software</span>
                      <span class="type-desc">Build and track software projects</span>
                    </div>
                  </div>
                </label>

                <label class="type-option" [class.selected]="formData.projectType === 'business'">
                  <input type="radio" name="projectType" [(ngModel)]="formData.projectType" value="business" />
                  <div class="type-content">
                    <jira-icon name="briefcase" [size]="20" />
                    <div class="type-info">
                      <span class="type-name">Business</span>
                      <span class="type-desc">Manage business processes</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Project Lead -->
            <div class="form-group">
              <label>Project Lead</label>
              <select
                [(ngModel)]="formData.leadId"
                name="leadId"
                class="form-select"
              >
                <option [ngValue]="undefined">No lead assigned</option>
                <option *ngFor="let user of availableUsers()" [ngValue]="user.id">
                  {{ getUserDisplayName(user) }} ({{ user.email }})
                </option>
              </select>
              <span class="hint">The person responsible for this project</span>
            </div>

            <!-- Avatar URL (optional) -->
            <div class="form-group">
              <label>Avatar URL</label>
              <input
                type="url"
                [(ngModel)]="formData.avatar"
                name="avatar"
                placeholder="https://example.com/project-logo.png"
                class="form-input"
              />
              <span class="hint">Optional project logo or avatar</span>
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
            {{ submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Project') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog { background: var(--jira-neutral-0); border-radius: var(--radius-lg); width: 600px; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-lg); border-bottom: 1px solid var(--jira-neutral-200); }
    .dialog-header h2 { margin: 0; font-size: var(--font-size-lg); }
    .close-btn { border: none; background: transparent; cursor: pointer; padding: var(--spacing-xs); }
    .dialog-body { padding: var(--spacing-lg); overflow-y: auto; flex: 1; }
    .form-group { display: flex; flex-direction: column; gap: var(--spacing-xs); margin-bottom: var(--spacing-md); }
    .form-group label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--jira-neutral-800); }
    .form-group label.required::after { content: ' *'; color: var(--jira-danger); }
    .form-input, .form-select { padding: var(--spacing-sm); border: 1px solid var(--jira-neutral-300); border-radius: var(--radius-sm); font-size: var(--font-size-sm); font-family: inherit; background: var(--jira-neutral-0); color: var(--jira-neutral-1000); }
    .form-input:focus, .form-select:focus { outline: none; border-color: var(--jira-brand-primary); }
    .form-input.ng-invalid.ng-touched { border-color: var(--jira-danger); }
    .form-input:disabled { background: var(--jira-neutral-100); cursor: not-allowed; }
    .form-textarea { padding: var(--spacing-sm); border: 1px solid var(--jira-neutral-300); border-radius: var(--radius-sm); font-size: var(--font-size-sm); font-family: inherit; resize: vertical; background: var(--jira-neutral-0); color: var(--jira-neutral-1000); }
    .form-textarea:focus { outline: none; border-color: var(--jira-brand-primary); }
    .error { font-size: var(--font-size-xs); color: var(--jira-danger); }
    .hint { font-size: var(--font-size-xs); color: var(--jira-neutral-600); }

    .type-selector { display: flex; flex-direction: column; gap: var(--spacing-xs); }
    .type-option { display: flex; align-items: center; padding: var(--spacing-md); border: 2px solid var(--jira-neutral-300); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; }
    .type-option input[type="radio"] { display: none; }
    .type-option:hover { border-color: var(--jira-brand-primary); background: var(--jira-neutral-50); }
    .type-option.selected { border-color: var(--jira-brand-primary); background: var(--jira-info-bg); }
    .type-content { display: flex; align-items: center; gap: var(--spacing-md); width: 100%; }
    .type-info { display: flex; flex-direction: column; gap: 4px; }
    .type-name { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--jira-neutral-900); }
    .type-desc { font-size: var(--font-size-xs); color: var(--jira-neutral-600); }

    .dialog-footer { display: flex; justify-content: flex-end; gap: var(--spacing-sm); padding: var(--spacing-lg); border-top: 1px solid var(--jira-neutral-200); }
    .btn { padding: var(--spacing-xs) var(--spacing-md); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); }
    .btn-primary { background: var(--jira-brand-primary); color: var(--jira-neutral-0); }
    .btn-primary:hover:not(:disabled) { background: var(--jira-brand-primary-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-subtle { background: transparent; color: var(--jira-neutral-700); }
    .btn-subtle:hover { background: var(--jira-neutral-100); }
  `]
})
export class ProjectFormDialogComponent implements OnInit {
  @Input() project?: any; // For edit mode
  @Output() submit = new EventEmitter<CreateProjectDto | UpdateProjectDto>();
  @Output() cancel = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  submitting = false;
  isEditMode = false;

  availableUsers = signal<User[]>([]);

  formData: ProjectFormData = {
    key: '',
    name: '',
    description: '',
    leadId: undefined,
    projectType: 'software',
    avatar: ''
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Reset submitting flag
    this.submitting = false;

    // Load available users for project lead selection
    this.userService.getUsers(1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.availableUsers.set(response.data.filter(u => u.isActive));
        },
        error: (err) => console.error('Failed to load users:', err)
      });

    if (this.project) {
      this.isEditMode = true;
      this.formData = {
        key: this.project.key,
        name: this.project.name,
        description: this.project.description || '',
        leadId: this.project.lead?.id,
        projectType: this.project.projectType || 'software',
        avatar: this.project.avatar || ''
      };
    } else {
      // Reset form for create mode
      this.isEditMode = false;
      this.formData = {
        key: '',
        name: '',
        description: '',
        leadId: undefined,
        projectType: 'software',
        avatar: ''
      };
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isFormValid(): boolean {
    return this.formData.key.trim().length > 0 &&
           this.formData.name.trim().length > 0 &&
           /^[A-Z]+$/.test(this.formData.key);
  }

  submitForm(): void {
    if (!this.isFormValid() || this.submitting) return;

    this.submitting = true;

    const dto: any = {
      key: this.formData.key.trim().toUpperCase(),
      name: this.formData.name.trim(),
      description: this.formData.description?.trim() || undefined,
      leadId: this.formData.leadId || undefined,
      projectType: this.formData.projectType || 'software'
    };

    this.submit.emit(dto);
  }

  close(): void {
    this.submitting = false;
    this.cancel.emit();
  }

  getUserDisplayName(user: any): string {
    if (!user) return 'Unknown';
    if (user.displayName) return user.displayName;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.username || user.email;
  }
}
