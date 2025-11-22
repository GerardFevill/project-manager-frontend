import { Component, Input, OnInit, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { WorkLogService } from '../../../core/services/work-log.service';
import { TimeTracking } from '../../../core/models/work-log.model';

@Component({
  selector: 'app-time-tracking',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="time-tracking">
      <div class="tracking-header">
        <h3>Time Tracking</h3>
        <button class="btn btn-primary" (click)="logWork.emit()">
          <jira-icon leftIcon name="clock" [size]="14" />
          Log Work
        </button>
      </div>

      <div class="time-bars">
        <div class="time-row">
          <span class="label">Estimated</span>
          <span class="value">{{ formatTime(timeTracking().timeEstimate) }}</span>
        </div>
        <div class="time-row">
          <span class="label">Logged</span>
          <span class="value">{{ formatTime(timeTracking().timeSpent) }}</span>
        </div>
        <div class="time-row" *ngIf="timeTracking().timeRemaining !== null">
          <span class="label">Remaining</span>
          <span class="value">{{ formatTime(timeTracking().timeRemaining) }}</span>
        </div>
      </div>

      <div class="progress-bar" *ngIf="timeTracking().timeEstimate">
        <div
          class="progress-fill"
          [style.width.%]="getProgress()"
          [class.over]="getProgress() > 100"
        ></div>
      </div>

      <div class="work-logs" *ngIf="timeTracking().workLogs.length > 0">
        <h4>Work Log History</h4>
        <div *ngFor="let log of timeTracking().workLogs" class="work-log-item">
          <div class="log-header">
            <span class="log-author">{{ log.author.name }}</span>
            <span class="log-time">{{ formatTime(log.timeSpent) }}</span>
          </div>
          <p *ngIf="log.description" class="log-description">{{ log.description }}</p>
          <span class="log-date">{{ formatDate(log.startedAt) }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .time-tracking { display: flex; flex-direction: column; gap: var(--spacing-md); padding: var(--spacing-md); border: 1px solid var(--jira-neutral-200); border-radius: var(--radius-md); }
    .tracking-header { display: flex; justify-content: space-between; align-items: center; }
    .tracking-header h3 { margin: 0; font-size: var(--font-size-md); }
    .btn { padding: var(--spacing-xs) var(--spacing-sm); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--font-size-xs); }
    .btn-primary { background: var(--jira-brand-primary); color: white; }
    .time-bars { display: flex; flex-direction: column; gap: var(--spacing-xs); }
    .time-row { display: flex; justify-content: space-between; font-size: var(--font-size-sm); }
    .label { color: var(--jira-neutral-600); }
    .value { font-weight: var(--font-weight-semibold); }
    .progress-bar { height: 8px; background: var(--jira-neutral-200); border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--jira-success); transition: width 0.3s ease; }
    .progress-fill.over { background: var(--jira-danger); }
    .work-logs { display: flex; flex-direction: column; gap: var(--spacing-sm); }
    .work-logs h4 { margin: 0; font-size: var(--font-size-sm); color: var(--jira-neutral-700); }
    .work-log-item { padding: var(--spacing-sm); background: var(--jira-neutral-50); border-radius: var(--radius-sm); }
    .log-header { display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs); }
    .log-author { font-weight: var(--font-weight-semibold); font-size: var(--font-size-xs); }
    .log-time { color: var(--jira-brand-primary); font-size: var(--font-size-xs); }
    .log-description { margin: var(--spacing-xs) 0; font-size: var(--font-size-xs); color: var(--jira-neutral-700); }
    .log-date { font-size: var(--font-size-xs); color: var(--jira-neutral-500); }
  `]
})
export class TimeTrackingComponent implements OnInit {
  @Input() issueId!: string;
  @Input() timeTracking = signal<TimeTracking>({ timeSpent: 0, workLogs: [] });
  @Output() logWork = new EventEmitter<void>();

  constructor(private workLogService: WorkLogService) {}

  ngOnInit(): void {}

  formatTime(minutes?: number | null): string {
    if (!minutes) return '0h';
    return this.workLogService.formatDuration(minutes);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getProgress(): number {
    return this.workLogService.calculateProgress(
      this.timeTracking().timeEstimate,
      this.timeTracking().timeSpent
    );
  }
}
