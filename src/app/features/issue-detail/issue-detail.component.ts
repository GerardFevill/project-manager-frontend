import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CommentListComponent } from '../../shared/components/comment/comment-list.component';
import { AttachmentListComponent } from '../../shared/components/attachment/attachment-list.component';
import { TimeTrackingComponent } from '../../shared/components/work-log/time-tracking.component';
import { WorkLogDialogComponent } from '../../shared/components/work-log/work-log-dialog.component';
import { IssueService, Issue } from '../../core/services/issue.service';
import { WorkLogService } from '../../core/services/work-log.service';
import { TimeTracking } from '../../core/models/work-log.model';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    BadgeComponent,
    ButtonComponent,
    CommentListComponent,
    AttachmentListComponent,
    TimeTrackingComponent,
    WorkLogDialogComponent
  ],
  template: `
    <div class="issue-detail-page" *ngIf="!loading(); else loadingState">
      <div *ngIf="issue()" class="issue-detail">
        <!-- Header -->
        <div class="issue-header">
          <button class="back-btn" (click)="goBack()">
            <jira-icon name="chevron-left" [size]="16" />
            Back
          </button>
          <div class="header-actions">
            <jira-button variant="subtle" size="medium">
              <jira-icon leftIcon name="link" [size]="14" />
              Copy Link
            </jira-button>
            <jira-button variant="subtle" size="medium">
              <jira-icon leftIcon name="more" [size]="14" />
              Actions
            </jira-button>
          </div>
        </div>

        <!-- Title -->
        <div class="issue-title">
          <jira-badge [variant]="getTypeVariant(issue()!.type)" size="medium">
            {{ issue()!.type }}
          </jira-badge>
          <h1>{{ issue()!.key }} - {{ issue()!.summary }}</h1>
        </div>

        <!-- Content -->
        <div class="issue-content">
          <!-- Main Column -->
          <div class="main-column">
            <div class="section">
              <h2>Description</h2>
              <p class="description">{{ issue()!.description || 'No description provided' }}</p>
            </div>

            <div class="section">
              <app-attachment-list [issueId]="issue()!.id" />
            </div>

            <div class="section">
              <app-comment-list
                [issueId]="issue()!.id"
                [currentUserId]="currentUserId"
              />
            </div>
          </div>

          <!-- Sidebar -->
          <div class="sidebar">
            <div class="detail-group">
              <label>Status</label>
              <jira-badge [variant]="getStatusVariant(issue()!.status)">
                {{ formatStatus(issue()!.status) }}
              </jira-badge>
            </div>

            <div class="detail-group">
              <label>Priority</label>
              <jira-badge [variant]="getPriorityVariant(issue()!.priority)">
                {{ issue()!.priority }}
              </jira-badge>
            </div>

            <div class="detail-group">
              <label>Assignee</label>
              <span>{{ issue()!.assignee?.name || 'Unassigned' }}</span>
            </div>

            <div class="detail-group">
              <label>Reporter</label>
              <span>{{ issue()!.reporter.name }}</span>
            </div>

            <div class="detail-group" *ngIf="issue()!.sprint">
              <label>Sprint</label>
              <span>{{ issue()!.sprint?.name }}</span>
            </div>

            <div class="detail-group">
              <label>Created</label>
              <span>{{ formatDate(issue()!.createdAt) }}</span>
            </div>

            <div class="detail-group">
              <label>Updated</label>
              <span>{{ formatDate(issue()!.updatedAt) }}</span>
            </div>

            <div class="section">
              <app-time-tracking
                [issueId]="issue()!.id"
                [timeTracking]="timeTracking"
                (logWork)="showWorkLogDialog.set(true)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingState>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading issue...</p>
      </div>
    </ng-template>

    <app-work-log-dialog
      *ngIf="showWorkLogDialog()"
      (submit)="onWorkLogSubmit($event)"
      (cancel)="showWorkLogDialog.set(false)"
    />
  `,
  styles: [`
    .issue-detail-page { padding: var(--spacing-xl); max-width: 1400px; margin: 0 auto; }
    .issue-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg); }
    .back-btn { display: flex; align-items: center; gap: var(--spacing-xs); padding: var(--spacing-xs) var(--spacing-sm); border: none; background: transparent; cursor: pointer; font-size: var(--font-size-sm); }
    .header-actions { display: flex; gap: var(--spacing-sm); }
    .issue-title { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-2xl); }
    .issue-title h1 { margin: 0; font-size: var(--font-size-2xl); }
    .issue-content { display: grid; grid-template-columns: 1fr 300px; gap: var(--spacing-2xl); }
    .main-column { display: flex; flex-direction: column; gap: var(--spacing-2xl); }
    .sidebar { display: flex; flex-direction: column; gap: var(--spacing-lg); }
    .section { background: var(--jira-neutral-0); border: 1px solid var(--jira-neutral-200); border-radius: var(--radius-md); padding: var(--spacing-lg); }
    .section h2 { margin: 0 0 var(--spacing-md) 0; font-size: var(--font-size-md); }
    .description { margin: 0; color: var(--jira-neutral-700); line-height: 1.6; white-space: pre-wrap; }
    .detail-group { display: flex; flex-direction: column; gap: var(--spacing-xs); padding-bottom: var(--spacing-md); border-bottom: 1px solid var(--jira-neutral-200); }
    .detail-group:last-child { border-bottom: none; }
    .detail-group label { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--jira-neutral-600); text-transform: uppercase; }
    .detail-group span { font-size: var(--font-size-sm); color: var(--jira-neutral-1000); }
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--spacing-3xl); gap: var(--spacing-md); }
    .spinner { width: 48px; height: 48px; border: 4px solid var(--jira-neutral-200); border-top-color: var(--jira-brand-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) { .issue-content { grid-template-columns: 1fr; } }
  `]
})
export class IssueDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  issue = signal<Issue | null>(null);
  timeTracking = signal<TimeTracking>({ timeSpent: 0, workLogs: [] });
  loading = signal(true);
  showWorkLogDialog = signal(false);
  currentUserId = 'current-user-id'; // TODO: Get from auth service

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issueService: IssueService,
    private workLogService: WorkLogService
  ) {}

  ngOnInit(): void {
    const issueId = this.route.snapshot.paramMap.get('id');
    if (!issueId) {
      this.router.navigate(['/backlog']);
      return;
    }
    this.loadIssue(issueId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadIssue(id: string): void {
    this.loading.set(true);

    forkJoin({
      issue: this.issueService.getIssueDetail(id),
      timeTracking: this.workLogService.getTimeTracking(id)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ issue, timeTracking }) => {
          this.issue.set(issue);
          this.timeTracking.set(timeTracking);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading issue:', err);
          this.loading.set(false);
          this.router.navigate(['/backlog']);
        }
      });
  }

  onWorkLogSubmit(dto: any): void {
    const issueId = this.issue()?.id;
    if (!issueId) return;

    this.workLogService.createWorkLog(issueId, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showWorkLogDialog.set(false);
          this.loadIssue(issueId); // Reload to get updated time
        },
        error: () => alert('Failed to log work')
      });
  }

  goBack(): void {
    this.router.navigate(['/backlog']);
  }

  getTypeVariant(type: string): any {
    const map: any = { story: 'success', task: 'info', bug: 'danger', epic: 'primary' };
    return map[type] || 'default';
  }

  getStatusVariant(status: string): any {
    const map: any = { todo: 'default', 'in-progress': 'info', review: 'warning', done: 'success' };
    return map[status] || 'default';
  }

  getPriorityVariant(priority: string): any {
    const map: any = { highest: 'danger', high: 'warning', medium: 'info', low: 'success' };
    return map[priority] || 'default';
  }

  formatStatus(status: string): string {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
