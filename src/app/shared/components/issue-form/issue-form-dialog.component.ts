import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import {
  Issue,
  CreateIssueDto,
  UpdateIssueDto,
  IssueType,
  IssuePriority,
  IssueStatus,
  User,
  Sprint
} from '../../../core/services/issue.service';
import { Epic } from '../../../core/models/epic.model';
import { EpicService } from '../../../core/services/epic.service';

@Component({
  selector: 'app-issue-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="dialog-overlay" (click)="close()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>{{ isEditMode() ? 'Edit Issue' : 'Create Issue' }}</h2>
          <button class="close-btn" (click)="close()">
            <jira-icon name="close" [size]="16" />
          </button>
        </div>

        <div class="dialog-body">
          <form #issueForm="ngForm">
            <!-- Issue Type -->
            <div class="form-group">
              <label class="required">Issue Type</label>
              <div class="type-selector">
                <button
                  *ngFor="let type of issueTypes"
                  type="button"
                  class="type-option"
                  [class.selected]="formData.type === type"
                  (click)="formData.type = type"
                >
                  <jira-icon [name]="getTypeIcon(type)" [size]="16" />
                  <span>{{ type | titlecase }}</span>
                </button>
              </div>
            </div>

            <!-- Summary -->
            <div class="form-group">
              <label class="required">Summary</label>
              <input
                type="text"
                [(ngModel)]="formData.summary"
                name="summary"
                placeholder="What needs to be done?"
                class="form-input"
                required
                #summaryInput="ngModel"
              />
              <span class="error" *ngIf="summaryInput.invalid && summaryInput.touched">
                Summary is required
              </span>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label>Description</label>
              <textarea
                [(ngModel)]="formData.description"
                name="description"
                rows="6"
                placeholder="Add a detailed description..."
                class="form-input"
              ></textarea>
            </div>

            <!-- Priority -->
            <div class="form-group">
              <label class="required">Priority</label>
              <div class="priority-selector">
                <button
                  *ngFor="let priority of priorities"
                  type="button"
                  class="priority-option"
                  [class.selected]="formData.priority === priority"
                  [class]="'priority-' + priority"
                  (click)="formData.priority = priority"
                >
                  <jira-icon [name]="getPriorityIcon(priority)" [size]="14" />
                  <span>{{ priority | titlecase }}</span>
                </button>
              </div>
            </div>

            <!-- Status (only in edit mode) -->
            <div class="form-group" *ngIf="isEditMode()">
              <label class="required">Status</label>
              <select [(ngModel)]="formData.status" name="status" class="form-select">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <!-- Assignee -->
            <div class="form-group">
              <label>Assignee</label>
              <select
                [(ngModel)]="formData.assigneeId"
                name="assigneeId"
                class="form-select"
              >
                <option [ngValue]="null">Unassigned</option>
                <option *ngFor="let user of availableUsers()" [ngValue]="user.id">
                  {{ getUserDisplayName(user) }}
                </option>
              </select>
            </div>

            <!-- Sprint -->
            <div class="form-group">
              <label>Sprint</label>
              <select
                [(ngModel)]="formData.sprintId"
                name="sprintId"
                class="form-select"
              >
                <option [ngValue]="null">No Sprint</option>
                <option *ngFor="let sprint of availableSprints()" [ngValue]="sprint.id">
                  {{ sprint.name }}
                </option>
              </select>
            </div>

            <!-- Epic -->
            <div class="form-group">
              <label>Epic</label>
              <select
                [(ngModel)]="formData.epicId"
                name="epicId"
                class="form-select"
              >
                <option [ngValue]="null">No Epic</option>
                <option *ngFor="let epic of availableEpics()" [ngValue]="epic.id">
                  {{ epic.key }} - {{ epic.name }}
                </option>
              </select>
            </div>

            <!-- Story Points -->
            <div class="form-group">
              <label>Story Points</label>
              <input
                type="number"
                [(ngModel)]="formData.storyPoints"
                name="storyPoints"
                min="0"
                placeholder="Estimate complexity..."
                class="form-input"
              />
            </div>

            <!-- Time Estimate -->
            <div class="form-group">
              <label>Time Estimate</label>
              <input
                type="text"
                [(ngModel)]="formData.timeEstimate"
                name="timeEstimate"
                placeholder="e.g. 2h 30m, 150m"
                class="form-input"
              />
              <span class="hint">Enter time in hours/minutes (e.g., 2h 30m or 150m)</span>
            </div>

            <!-- Labels -->
            <div class="form-group">
              <label>Labels</label>
              <div class="labels-input">
                <div class="selected-labels" *ngIf="formData.labels && formData.labels.length > 0">
                  <span
                    *ngFor="let label of formData.labels; let i = index"
                    class="label-chip"
                  >
                    {{ label }}
                    <button type="button" (click)="removeLabel(i)" class="remove-label">
                      <jira-icon name="close" [size]="10" />
                    </button>
                  </span>
                </div>
                <div class="add-label-row">
                  <input
                    type="text"
                    [(ngModel)]="newLabel"
                    name="newLabel"
                    placeholder="Add label..."
                    class="form-input"
                    (keydown.enter)="addLabel(); $event.preventDefault()"
                  />
                  <button type="button" class="btn btn-subtle" (click)="addLabel()">
                    Add
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-subtle" (click)="close()">Cancel</button>
          <button
            class="btn btn-primary"
            (click)="submitForm()"
            [disabled]="!isFormValid() || submitting()"
          >
            {{ submitting() ? 'Saving...' : (isEditMode() ? 'Save Changes' : 'Create Issue') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog { background: white; border-radius: var(--radius-lg); width: 600px; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; }
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
    .hint { font-size: var(--font-size-xs); color: var(--jira-neutral-600); }
    .error { font-size: var(--font-size-xs); color: var(--jira-danger); }

    .type-selector { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: var(--spacing-xs); }
    .type-option { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-xs); padding: var(--spacing-md); border: 2px solid var(--jira-neutral-300); border-radius: var(--radius-md); background: white; cursor: pointer; transition: all 0.2s; }
    .type-option:hover { border-color: var(--jira-brand-primary); background: var(--jira-brand-bg); }
    .type-option.selected { border-color: var(--jira-brand-primary); background: var(--jira-brand-bg); }
    .type-option span { font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); }

    .priority-selector { display: flex; flex-direction: column; gap: var(--spacing-xs); }
    .priority-option { display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-sm); border: 1px solid var(--jira-neutral-300); border-radius: var(--radius-sm); background: white; cursor: pointer; transition: all 0.2s; }
    .priority-option:hover { background: var(--jira-neutral-50); }
    .priority-option.selected { border-color: var(--jira-brand-primary); background: var(--jira-brand-bg); }
    .priority-option span { font-size: var(--font-size-sm); }

    .labels-input { display: flex; flex-direction: column; gap: var(--spacing-sm); }
    .selected-labels { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); }
    .label-chip { display: inline-flex; align-items: center; gap: var(--spacing-xs); padding: 4px var(--spacing-sm); background: var(--jira-neutral-200); border-radius: var(--radius-sm); font-size: var(--font-size-xs); }
    .remove-label { border: none; background: transparent; cursor: pointer; padding: 0; display: flex; align-items: center; }
    .add-label-row { display: flex; gap: var(--spacing-sm); }

    .dialog-footer { display: flex; justify-content: flex-end; gap: var(--spacing-sm); padding: var(--spacing-lg); border-top: 1px solid var(--jira-neutral-200); }
    .btn { padding: var(--spacing-xs) var(--spacing-md); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); }
    .btn-primary { background: var(--jira-brand-primary); color: white; }
    .btn-primary:hover:not(:disabled) { background: var(--jira-brand-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-subtle { background: transparent; color: var(--jira-neutral-700); }
    .btn-subtle:hover { background: var(--jira-neutral-100); }
  `]
})
export class IssueFormDialogComponent implements OnInit {
  @Input() issue?: Issue; // For edit mode
  @Input() availableUsers = signal<User[]>([]);
  @Input() availableSprints = signal<Sprint[]>([]);
  @Output() submit = new EventEmitter<CreateIssueDto | UpdateIssueDto>();
  @Output() cancel = new EventEmitter<void>();

  submitting = signal(false);
  newLabel = '';
  availableEpics = signal<Epic[]>([]);

  private epicService = inject(EpicService);

  issueTypes: IssueType[] = ['story', 'task', 'bug', 'epic'];
  priorities: IssuePriority[] = ['highest', 'high', 'medium', 'low', 'lowest'];

  formData: {
    type: IssueType;
    summary: string;
    description: string;
    priority: IssuePriority;
    status?: IssueStatus;
    assigneeId: string | null;
    sprintId: string | null;
    epicId: string | null;
    storyPoints: number | null;
    timeEstimate: string;
    labels: string[];
  } = {
    type: 'task',
    summary: '',
    description: '',
    priority: 'medium',
    assigneeId: null,
    sprintId: null,
    epicId: null,
    storyPoints: null,
    timeEstimate: '',
    labels: []
  };

  ngOnInit(): void {
    // Load epics
    this.epicService.getEpics(1, 100).subscribe({
      next: (response) => this.availableEpics.set(response.items || []),
      error: () => console.error('Failed to load epics')
    });

    if (this.issue) {
      // Edit mode - populate form with existing data
      this.formData = {
        type: this.issue.type as IssueType,
        summary: this.issue.summary,
        description: this.issue.description || '',
        priority: this.issue.priority as IssuePriority,
        status: this.issue.status as IssueStatus,
        assigneeId: this.issue.assignee?.id || null,
        sprintId: this.issue.sprint?.id || null,
        epicId: this.issue.epicId || null,
        storyPoints: this.issue.storyPoints || null,
        timeEstimate: this.formatTimeEstimate(this.issue.timeEstimate),
        labels: this.issue.labels ? [...this.issue.labels] : []
      };
    }
  }

  isEditMode(): boolean {
    return !!this.issue;
  }

  isFormValid(): boolean {
    return this.formData.summary.trim().length > 0;
  }

  addLabel(): void {
    const label = this.newLabel.trim();
    if (label && !this.formData.labels.includes(label)) {
      this.formData.labels.push(label);
      this.newLabel = '';
    }
  }

  removeLabel(index: number): void {
    this.formData.labels.splice(index, 1);
  }

  submitForm(): void {
    if (!this.isFormValid() || this.submitting()) return;

    this.submitting.set(true);

    const timeEstimate = this.parseTimeEstimate(this.formData.timeEstimate);

    const dto: any = {
      type: this.formData.type,
      summary: this.formData.summary.trim(),
      description: this.formData.description.trim() || undefined,
      priority: this.formData.priority,
      assigneeId: this.formData.assigneeId || undefined,
      sprintId: this.formData.sprintId || undefined,
      epicId: this.formData.epicId || undefined,
      storyPoints: this.formData.storyPoints || undefined,
      timeEstimate: timeEstimate || undefined,
      labels: this.formData.labels.length > 0 ? this.formData.labels : undefined
    };

    if (this.isEditMode()) {
      dto.status = this.formData.status;
    }

    this.submit.emit(dto);
  }

  close(): void {
    this.cancel.emit();
  }

  getTypeIcon(type: IssueType): any {
    const icons: Record<IssueType, string> = {
      story: 'book',
      task: 'check-square',
      bug: 'bug',
      epic: 'zap',
      subtask: 'list'
    };
    return icons[type] || 'check-square';
  }

  getPriorityIcon(priority: IssuePriority): any {
    const icons: Record<IssuePriority, string> = {
      highest: 'arrow-up',
      high: 'arrow-up',
      medium: 'minus',
      low: 'arrow-down',
      lowest: 'arrow-down'
    };
    return icons[priority] || 'minus';
  }

  private parseTimeEstimate(input: string): number | null {
    if (!input || !input.trim()) return null;

    const trimmed = input.trim().toLowerCase();
    const hoursMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*h(?:\s*(\d+)\s*m)?/);
    if (hoursMatch) {
      const hours = parseFloat(hoursMatch[1]);
      const minutes = hoursMatch[2] ? parseInt(hoursMatch[2], 10) : 0;
      return Math.round(hours * 60 + minutes);
    }
    const minutesMatch = trimmed.match(/(\d+)\s*m/);
    if (minutesMatch) return parseInt(minutesMatch[1], 10);
    const numberMatch = trimmed.match(/^(\d+)$/);
    if (numberMatch) return parseInt(numberMatch[1], 10);
    return null;
  }

  private formatTimeEstimate(minutes?: number): string {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  }
  getUserDisplayName(user: any): string {
    if (!user) return 'Unknown';
    if (user.displayName) return user.displayName;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.username || user.email;
  }
}
