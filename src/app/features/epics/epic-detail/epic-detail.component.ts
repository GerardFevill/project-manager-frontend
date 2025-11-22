import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { EpicFormDialogComponent } from '../../../shared/components/epic-form/epic-form-dialog.component';
import { Epic, EPIC_STATUS_CONFIG } from '../../../core/models/epic.model';
import { Issue } from '../../../core/services/issue.service';
import { EpicService } from '../../../core/services/epic.service';
import { IssueService } from '../../../core/services/issue.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-epic-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    CardComponent,
    EpicFormDialogComponent,
  ],
  templateUrl: './epic-detail.component.html',
  styleUrls: ['./epic-detail.component.scss'],
})
export class EpicDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  epic = signal<Epic | null>(null);
  issues = signal<Issue[]>([]);
  loading = signal(true);
  loadingIssues = signal(true);
  error = signal<string | null>(null);

  showEditDialog = signal(false);
  showDeleteDialog = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private epicService: EpicService,
    private issueService: IssueService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const epicId = params['id'];
      if (epicId) {
        this.loadEpic(epicId);
        this.loadEpicIssues(epicId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEpic(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.epicService.getEpic(id, true).subscribe({
      next: (epic) => {
        this.epic.set(epic);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load epic');
        this.loading.set(false);
        console.error('Error loading epic:', error);
      },
    });
  }

  loadEpicIssues(epicId: string): void {
    this.loadingIssues.set(true);

    this.epicService.getEpicIssues(epicId).subscribe({
      next: (issues) => {
        this.issues.set(issues);
        this.loadingIssues.set(false);
      },
      error: (error) => {
        console.error('Error loading epic issues:', error);
        this.loadingIssues.set(false);
        // Don't show error, just log it
      },
    });
  }

  get statusConfig() {
    const epic = this.epic();
    return epic ? EPIC_STATUS_CONFIG[epic.status] : null;
  }

  get progress(): number {
    const epic = this.epic();
    if (!epic || !epic.totalIssues || epic.totalIssues === 0) {
      return 0;
    }
    return Math.round(((epic.completedIssues || 0) / epic.totalIssues) * 100);
  }

  openEditDialog(): void {
    this.showEditDialog.set(true);
  }

  openDeleteDialog(): void {
    this.showDeleteDialog.set(true);
  }

  onEpicUpdated(epic: Epic): void {
    this.showEditDialog.set(false);
    this.loadEpic(epic.id);
  }

  confirmDelete(): void {
    const epic = this.epic();
    if (!epic) return;

    this.epicService.deleteEpic(epic.id).subscribe({
      next: () => {
        this.toastService.success('Epic deleted successfully');
        this.router.navigate(['/epics']);
      },
      error: (error) => {
        this.toastService.error('Failed to delete epic');
        console.error('Error deleting epic:', error);
      },
    });
  }

  getStatusVariant(): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' {
    const epic = this.epic();
    if (!epic) return 'default';

    switch (epic.status) {
      case 'done':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getPriorityIcon(priority: string): any {
    const icons: Record<string, string> = {
      highest: 'angle-double-up',
      high: 'angle-up',
      medium: 'minus',
      low: 'angle-down',
      lowest: 'angle-double-down',
    };
    return icons[priority] || 'minus';
  }

  getTypeIcon(type: string): any {
    const icons: Record<string, string> = {
      story: 'bookmark',
      task: 'check-square',
      bug: 'bug',
      epic: 'zap',
      subtask: 'code-branch',
    };
    return icons[type] || 'circle';
  }

  getUserDisplayName(user: any): string {
    if (!user) return 'Unassigned';
    if (user.displayName) return user.displayName;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.username || user.email;
  }
}
