import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { CreateWorkLogDto } from '../../../core/models/work-log.model';

@Component({
  selector: 'app-work-log-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="dialog-overlay" (click)="close()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>Log Work</h2>
          <button class="close-btn" (click)="close()">
            <jira-icon name="close" [size]="16" />
          </button>
        </div>

        <div class="dialog-body">
          <div class="form-group">
            <label>Time Spent</label>
            <input
              type="text"
              [(ngModel)]="timeSpentInput"
              placeholder="e.g. 2h 30m, 150m"
              class="form-input"
            />
            <span class="hint">Enter time in hours/minutes (e.g., 2h 30m or 150m)</span>
          </div>

          <div class="form-group">
            <label>Work Started</label>
            <input
              type="datetime-local"
              [(ngModel)]="startedAtInput"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Description (optional)</label>
            <textarea
              [(ngModel)]="description"
              rows="3"
              placeholder="What did you work on?"
              class="form-input"
            ></textarea>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-subtle" (click)="close()">Cancel</button>
          <button class="btn btn-primary" (click)="submitWorkLog()" [disabled]="!isValid()">
            Log Work
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog { background: white; border-radius: var(--radius-lg); width: 500px; max-width: 90vw; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-lg); border-bottom: 1px solid var(--jira-neutral-200); }
    .dialog-header h2 { margin: 0; font-size: var(--font-size-lg); }
    .close-btn { border: none; background: transparent; cursor: pointer; }
    .dialog-body { padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md); }
    .form-group { display: flex; flex-direction: column; gap: var(--spacing-xs); }
    .form-group label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); }
    .form-input { padding: var(--spacing-sm); border: 1px solid var(--jira-neutral-300); border-radius: var(--radius-sm); font-size: var(--font-size-sm); }
    .form-input:focus { outline: none; border-color: var(--jira-brand-primary); }
    .hint { font-size: var(--font-size-xs); color: var(--jira-neutral-600); }
    .dialog-footer { display: flex; justify-content: flex-end; gap: var(--spacing-sm); padding: var(--spacing-lg); border-top: 1px solid var(--jira-neutral-200); }
    .btn { padding: var(--spacing-xs) var(--spacing-md); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--font-size-sm); }
    .btn-primary { background: var(--jira-brand-primary); color: white; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-subtle { background: transparent; color: var(--jira-neutral-700); }
  `]
})
export class WorkLogDialogComponent {
  @Output() submit = new EventEmitter<CreateWorkLogDto>();
  @Output() cancel = new EventEmitter<void>();

  timeSpentInput = '';
  startedAtInput = '';
  description = '';

  ngOnInit(): void {
    // Set default to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.startedAtInput = now.toISOString().slice(0, 16);
  }

  isValid(): boolean {
    return this.timeSpentInput.trim().length > 0;
  }

  submitWorkLog(): void {
    if (!this.isValid()) return;

    const timeSpent = this.parseTimeInput(this.timeSpentInput);
    if (timeSpent === null) {
      alert('Invalid time format. Use "2h 30m" or "150m"');
      return;
    }

    this.submit.emit({
      timeSpent,
      description: this.description.trim() || undefined,
      startedAt: new Date(this.startedAtInput)
    });
  }

  close(): void {
    this.cancel.emit();
  }

  private parseTimeInput(input: string): number | null {
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
}
