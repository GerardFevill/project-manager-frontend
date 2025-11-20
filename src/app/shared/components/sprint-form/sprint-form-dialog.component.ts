import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

export interface CreateSprintDto {
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateSprintDto {
  name?: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  status?: 'planned' | 'active' | 'completed';
}

@Component({
  selector: 'app-sprint-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="dialog-overlay" (click)="close()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>{{ isEditMode ? 'Edit Sprint' : 'Create Sprint' }}</h2>
          <button class="close-btn" (click)="close()">
            <jira-icon name="close" [size]="16" />
          </button>
        </div>

        <div class="dialog-body">
          <form #sprintForm="ngForm">
            <!-- Sprint Name -->
            <div class="form-group">
              <label class="required">Sprint Name</label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                name="name"
                placeholder="Sprint 1"
                class="form-input"
                required
                #nameInput="ngModel"
              />
              <span class="error" *ngIf="nameInput.invalid && nameInput.touched">
                Sprint name is required
              </span>
            </div>

            <!-- Sprint Goal -->
            <div class="form-group">
              <label>Sprint Goal</label>
              <textarea
                [(ngModel)]="formData.goal"
                name="goal"
                rows="3"
                placeholder="What are the objectives for this sprint?"
                class="form-input"
              ></textarea>
            </div>

            <!-- Start Date -->
            <div class="form-group">
              <label class="required">Start Date</label>
              <input
                type="date"
                [(ngModel)]="formData.startDate"
                name="startDate"
                class="form-input"
                required
              />
            </div>

            <!-- End Date -->
            <div class="form-group">
              <label class="required">End Date</label>
              <input
                type="date"
                [(ngModel)]="formData.endDate"
                name="endDate"
                class="form-input"
                required
                [min]="formData.startDate"
              />
            </div>

            <!-- Status (only in edit mode) -->
            <div class="form-group" *ngIf="isEditMode">
              <label class="required">Status</label>
              <select [(ngModel)]="formData.status" name="status" class="form-select">
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <!-- Duration Info -->
            <div class="info-box" *ngIf="getDuration() > 0">
              <jira-icon name="info" [size]="14" />
              <span>Sprint duration: {{ getDuration() }} days</span>
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
            {{ submitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Sprint') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog { background: white; border-radius: var(--radius-lg); width: 500px; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-lg); border-bottom: 1px solid var(--jira-neutral-200); }
    .dialog-header h2 { margin: 0; font-size: var(--font-size-lg); }
    .close-btn { border: none; background: transparent; cursor: pointer; padding: var(--spacing-xs); }
    .dialog-body { padding: var(--spacing-lg); overflow-y: auto; flex: 1; }
    .form-group { display: flex; flex-direction: column; gap: var(--spacing-xs); margin-bottom: var(--spacing-md); }
    .form-group label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--jira-neutral-800); }
    .form-group label.required::after { content: ' *'; color: var(--jira-danger); }
    .form-input, .form-select { padding: var(--spacing-sm); border: 1px solid var(--jira-neutral-300); border-radius: var(--radius-sm); font-size: var(--font-size-sm); font-family: inherit; }
    .form-input:focus, .form-select:focus { outline: none; border-color: var(--jira-brand-primary); }
    .form-input.ng-invalid.ng-touched, .form-select.ng-invalid.ng-touched { border-color: var(--jira-danger); }
    .error { font-size: var(--font-size-xs); color: var(--jira-danger); }
    .info-box { display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-sm); background: var(--jira-info-bg); border-radius: var(--radius-sm); color: var(--jira-info); font-size: var(--font-size-sm); }
    .dialog-footer { display: flex; justify-content: flex-end; gap: var(--spacing-sm); padding: var(--spacing-lg); border-top: 1px solid var(--jira-neutral-200); }
    .btn { padding: var(--spacing-xs) var(--spacing-md); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); }
    .btn-primary { background: var(--jira-brand-primary); color: white; }
    .btn-primary:hover:not(:disabled) { background: var(--jira-brand-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-subtle { background: transparent; color: var(--jira-neutral-700); }
    .btn-subtle:hover { background: var(--jira-neutral-100); }
  `]
})
export class SprintFormDialogComponent implements OnInit {
  @Input() sprint?: any; // For edit mode
  @Output() submit = new EventEmitter<CreateSprintDto | UpdateSprintDto>();
  @Output() cancel = new EventEmitter<void>();

  submitting = false;
  isEditMode = false;

  formData: {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    status?: 'planned' | 'active' | 'completed';
  } = {
    name: '',
    goal: '',
    startDate: '',
    endDate: ''
  };

  ngOnInit(): void {
    if (this.sprint) {
      this.isEditMode = true;
      this.formData = {
        name: this.sprint.name,
        goal: this.sprint.goal || '',
        startDate: this.formatDateForInput(this.sprint.startDate),
        endDate: this.formatDateForInput(this.sprint.endDate),
        status: this.sprint.status
      };
    } else {
      // Set default dates (2 weeks from now)
      const today = new Date();
      const twoWeeksLater = new Date(today);
      twoWeeksLater.setDate(today.getDate() + 14);

      this.formData.startDate = this.formatDateForInput(today);
      this.formData.endDate = this.formatDateForInput(twoWeeksLater);
    }
  }

  isFormValid(): boolean {
    return this.formData.name.trim().length > 0 &&
           this.formData.startDate.length > 0 &&
           this.formData.endDate.length > 0 &&
           new Date(this.formData.endDate) >= new Date(this.formData.startDate);
  }

  getDuration(): number {
    if (!this.formData.startDate || !this.formData.endDate) return 0;
    const start = new Date(this.formData.startDate);
    const end = new Date(this.formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  submitForm(): void {
    if (!this.isFormValid() || this.submitting) return;

    this.submitting = true;

    const dto: any = {
      name: this.formData.name.trim(),
      goal: this.formData.goal.trim() || undefined,
      startDate: new Date(this.formData.startDate),
      endDate: new Date(this.formData.endDate)
    };

    if (this.isEditMode) {
      dto.status = this.formData.status;
    }

    this.submit.emit(dto);
  }

  close(): void {
    this.cancel.emit();
  }

  private formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
