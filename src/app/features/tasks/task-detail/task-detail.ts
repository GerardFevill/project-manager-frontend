import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { TaskService, NotificationService, CommentService, WorkLogService } from '../../../core/services';
import { Task, TaskStatus, TaskHistory, TaskProgress, Comment, User, WorkLog, TimeTrackingSummary, formatHours } from '../../../core/models';
import { TASK_MESSAGES } from '../../../core/constants/messages';
import { FormsModule } from '@angular/forms';
import {
  TaskStatusBadgeComponent,
  TaskProgressBarComponent,
  CreateTaskDialogComponent,
  ConfirmDialogComponent,
  TaskBlockDialogComponent,
  UserAvatarComponent,
  TaskCommentComponent,
  LogWorkDialogComponent
} from '../../../shared/components';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatTabsModule,
    TaskStatusBadgeComponent,
    TaskProgressBarComponent,
    UserAvatarComponent,
    TaskCommentComponent
  ],
  templateUrl: './task-detail-jira.html',
  styleUrl: './task-detail-jira.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private notificationService = inject(NotificationService);
  private commentService = inject(CommentService);
  private workLogService = inject(WorkLogService);
  private dialog = inject(MatDialog);

  task = signal<Task | null>(null);
  loading = signal(true);
  TaskStatus = TaskStatus;

  // History and Progress data
  history = signal<TaskHistory[]>([]);
  progress = signal<TaskProgress | null>(null);
  loadingHistory = signal(false);
  loadingProgress = signal(false);

  // Comments data
  comments = signal<Comment[]>([]);
  loadingComments = signal(false);
  savingComment = signal(false);
  newCommentContent = '';
  activeFilter = signal<'all' | 'comments' | 'history'>('all');

  // Current user (mock - in real app, get from auth service)
  currentUser = signal<User | null>({
    id: '00000000-0000-0000-0000-000000000001',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'developer' as any,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Time tracking data
  workLogs = signal<WorkLog[]>([]);
  timeSummary = signal<TimeTrackingSummary>({ totalLogged: 0, logCount: 0, lastLogDate: null });
  loadingTimeSummary = signal(false);
  showWorkLogs = signal(false);

  ngOnInit() {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.loadTask(taskId);
    }
  }

  loadTask(id: string) {
    this.loading.set(true);
    this.taskService.findOne(id, true).subscribe({
      next: (task) => {
        this.task.set(task);
        this.loading.set(false);
        // Load comments and time tracking
        this.loadComments(id);
        this.loadTimeTracking(id);
      },
      error: (err) => {
        console.error('Error loading task:', err);
        this.notificationService.error('Erreur lors du chargement de la tâche');
        this.loading.set(false);
        this.router.navigate(['/tasks']);
      }
    });
  }

  editTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      data: currentTask
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.update(currentTask.id, result).subscribe({
          next: () => {
            this.notificationService.success(TASK_MESSAGES.UPDATED);
            this.loadTask(currentTask.id);
          },
          error: (err) => {
            console.error('Error updating task:', err);
            this.notificationService.error(TASK_MESSAGES.UPDATE_ERROR);
          }
        });
      }
    });
  }

  toggleTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    this.taskService.toggle(currentTask.id).subscribe({
      next: () => {
        this.notificationService.success(TASK_MESSAGES.UPDATED);
        this.loadTask(currentTask.id);
      },
      error: (err) => {
        console.error('Error toggling task:', err);
        this.notificationService.error(TASK_MESSAGES.UPDATE_ERROR);
      }
    });
  }

  blockTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    const dialogRef = this.dialog.open(TaskBlockDialogComponent, {
      data: { task: currentTask }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.blockTask(currentTask.id, result.reason).subscribe({
          next: () => {
            this.notificationService.success('Tâche bloquée avec succès');
            this.loadTask(currentTask.id);
          },
          error: (err) => {
            console.error('Error blocking task:', err);
            this.notificationService.error('Erreur lors du blocage de la tâche');
          }
        });
      }
    });
  }

  unblockTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    this.taskService.unblockTask(currentTask.id).subscribe({
      next: () => {
        this.notificationService.success('Tâche débloquée avec succès');
        this.loadTask(currentTask.id);
      },
      error: (err) => {
        console.error('Error unblocking task:', err);
        this.notificationService.error('Erreur lors du déblocage de la tâche');
      }
    });
  }

  archiveTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Archiver la tâche',
        message: 'Êtes-vous sûr de vouloir archiver cette tâche ?',
        confirmText: 'Archiver',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.archiveTask(currentTask.id).subscribe({
          next: () => {
            this.notificationService.success('Tâche archivée avec succès');
            this.router.navigate(['/tasks']);
          },
          error: (err) => {
            console.error('Error archiving task:', err);
            this.notificationService.error('Erreur lors de l\'archivage');
          }
        });
      }
    });
  }

  deleteTask() {
    const currentTask = this.task();
    if (!currentTask) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: TASK_MESSAGES.CONFIRM_DELETE
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.remove(currentTask.id).subscribe({
          next: () => {
            this.notificationService.success(TASK_MESSAGES.DELETED);
            this.router.navigate(['/tasks']);
          },
          error: (err) => {
            console.error('Error deleting task:', err);
            this.notificationService.error(TASK_MESSAGES.DELETE_ERROR);
          }
        });
      }
    });
  }

  convertToProject() {
    const currentTask = this.task();
    if (!currentTask) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Convertir en projet',
        message: 'Voulez-vous convertir cette tâche en projet ?',
        confirmText: 'Convertir',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.convertToProject(currentTask.id).subscribe({
          next: () => {
            this.notificationService.success('Tâche convertie en projet avec succès');
            this.loadTask(currentTask.id);
          },
          error: (err) => {
            console.error('Error converting to project:', err);
            this.notificationService.error('Erreur lors de la conversion');
          }
        });
      }
    });
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status !== TaskStatus.COMPLETED;
  }

  formatDate(date: string | Date | undefined | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(date: string | Date | undefined | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getIssueTypeIcon(issueType: string): string {
    switch (issueType) {
      case 'epic': return 'bolt';
      case 'story': return 'bookmark';
      case 'task': return 'check_box';
      case 'bug': return 'bug_report';
      case 'subtask': return 'subdirectory_arrow_right';
      default: return 'check_box';
    }
  }

  getIssueTypeColor(issueType: string): string {
    switch (issueType) {
      case 'epic': return '#6554C0';
      case 'story': return '#00875A';
      case 'task': return '#0052CC';
      case 'bug': return '#DE350B';
      case 'subtask': return '#5E6C84';
      default: return '#0052CC';
    }
  }

  // Load history when history tab is selected
  loadHistory() {
    const currentTask = this.task();
    if (!currentTask || this.history().length > 0) return; // Don't reload if already loaded

    this.loadingHistory.set(true);
    this.taskService.getTaskHistory(currentTask.id).subscribe({
      next: (history) => {
        this.history.set(history);
        this.loadingHistory.set(false);
      },
      error: (err) => {
        console.error('Error loading task history:', err);
        this.notificationService.error('Erreur lors du chargement de l\'historique');
        this.loadingHistory.set(false);
      }
    });
  }

  // Load progress details when progress tab is selected
  loadProgressDetails() {
    const currentTask = this.task();
    if (!currentTask || this.progress() !== null) return; // Don't reload if already loaded

    this.loadingProgress.set(true);
    this.taskService.getTaskProgress(currentTask.id).subscribe({
      next: (progress) => {
        this.progress.set(progress);
        this.loadingProgress.set(false);
      },
      error: (err) => {
        console.error('Error loading task progress:', err);
        this.notificationService.error('Erreur lors du chargement de la progression');
        this.loadingProgress.set(false);
      }
    });
  }

  // Called when tab changes
  onTabChange(index: number) {
    if (index === 1) {
      // History tab
      this.loadHistory();
    } else if (index === 2) {
      // Progress tab
      this.loadProgressDetails();
    }
  }

  // ============================================================================
  // COMMENTS METHODS
  // ============================================================================

  /**
   * Load comments for the current task
   */
  loadComments(taskId: string) {
    this.loadingComments.set(true);
    this.commentService.findByTask(taskId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.loadingComments.set(false);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.notificationService.error('Error loading comments');
        this.loadingComments.set(false);
      }
    });
  }

  /**
   * Add a new comment
   */
  addComment() {
    const currentTask = this.task();
    const user = this.currentUser();
    if (!currentTask || !user || !this.newCommentContent.trim()) return;

    this.savingComment.set(true);
    this.commentService.create({
      content: this.newCommentContent,
      taskId: currentTask.id,
      authorId: user.id
    }).subscribe({
      next: (comment) => {
        this.comments.update(comments => [comment, ...comments]);
        this.newCommentContent = '';
        this.savingComment.set(false);
        this.notificationService.success('Comment added successfully');
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.notificationService.error('Error adding comment');
        this.savingComment.set(false);
      }
    });
  }

  /**
   * Update an existing comment
   */
  updateComment(event: { id: string; content: string }) {
    const user = this.currentUser();
    if (!user) return;

    this.commentService.update(event.id, { content: event.content }, user.id).subscribe({
      next: (updatedComment) => {
        this.comments.update(comments =>
          comments.map(c => c.id === event.id ? updatedComment : c)
        );
        this.notificationService.success('Comment updated successfully');
      },
      error: (err) => {
        console.error('Error updating comment:', err);
        this.notificationService.error('Error updating comment');
      }
    });
  }

  /**
   * Delete a comment
   */
  deleteComment(commentId: string) {
    const user = this.currentUser();
    if (!user) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Comment',
        message: 'Are you sure you want to delete this comment? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.commentService.remove(commentId, user.id).subscribe({
          next: () => {
            this.comments.update(comments =>
              comments.filter(c => c.id !== commentId)
            );
            this.notificationService.success('Comment deleted successfully');
          },
          error: (err) => {
            console.error('Error deleting comment:', err);
            this.notificationService.error('Error deleting comment');
          }
        });
      }
    });
  }

  /**
   * Check if current user can edit a comment
   */
  canEditComment(comment: Comment): boolean {
    const user = this.currentUser();
    return user !== null && comment.authorId === user.id;
  }

  /**
   * Set the active filter
   */
  setFilter(filter: 'all' | 'comments' | 'history') {
    this.activeFilter.set(filter);
  }

  // ============================================================================
  // TIME TRACKING METHODS
  // ============================================================================

  /**
   * Load time tracking data for the current task
   */
  loadTimeTracking(taskId: string) {
    this.loadingTimeSummary.set(true);

    // Load work logs
    this.workLogService.findByTask(taskId).subscribe({
      next: (logs) => {
        this.workLogs.set(logs);
      },
      error: (err) => {
        console.error('Error loading work logs:', err);
      }
    });

    // Load summary
    this.workLogService.getTaskSummary(taskId).subscribe({
      next: (summary) => {
        this.timeSummary.set(summary);
        this.loadingTimeSummary.set(false);
      },
      error: (err) => {
        console.error('Error loading time summary:', err);
        this.loadingTimeSummary.set(false);
      }
    });
  }

  /**
   * Open log work dialog
   */
  openLogWorkDialog(workLog?: WorkLog) {
    const currentTask = this.task();
    if (!currentTask) return;

    const dialogRef = this.dialog.open(LogWorkDialogComponent, {
      width: '600px',
      data: {
        taskId: currentTask.id,
        workLog: workLog
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const user = this.currentUser();
        if (!user) return;

        if (workLog) {
          // Update existing work log
          this.workLogService.update(workLog.id, result, user.id).subscribe({
            next: (updated) => {
              this.workLogs.update(logs => logs.map(l => l.id === workLog.id ? updated : l));
              this.refreshTimeSummary();
              this.notificationService.success('Work log updated successfully');
            },
            error: (err) => {
              console.error('Error updating work log:', err);
              this.notificationService.error('Error updating work log');
            }
          });
        } else {
          // Create new work log
          this.workLogService.create({
            ...result,
            taskId: currentTask.id,
            userId: user.id
          }).subscribe({
            next: (created) => {
              this.workLogs.update(logs => [created, ...logs]);
              this.refreshTimeSummary();
              this.notificationService.success('Work logged successfully');
            },
            error: (err) => {
              console.error('Error logging work:', err);
              this.notificationService.error('Error logging work');
            }
          });
        }
      }
    });
  }

  /**
   * Edit work log
   */
  editWorkLog(workLog: WorkLog) {
    this.openLogWorkDialog(workLog);
  }

  /**
   * Delete work log
   */
  deleteWorkLog(workLogId: string) {
    const user = this.currentUser();
    if (!user) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Work Log',
        message: 'Are you sure you want to delete this work log? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workLogService.remove(workLogId, user.id).subscribe({
          next: () => {
            this.workLogs.update(logs => logs.filter(l => l.id !== workLogId));
            this.refreshTimeSummary();
            this.notificationService.success('Work log deleted successfully');
          },
          error: (err) => {
            console.error('Error deleting work log:', err);
            this.notificationService.error('Error deleting work log');
          }
        });
      }
    });
  }

  /**
   * Check if current user can edit a work log
   */
  canEditWorkLog(workLog: WorkLog): boolean {
    const user = this.currentUser();
    return user !== null && workLog.userId === user.id;
  }

  /**
   * Toggle work logs visibility
   */
  toggleWorkLogs() {
    this.showWorkLogs.update(show => !show);
  }

  /**
   * Refresh time summary
   */
  refreshTimeSummary() {
    const currentTask = this.task();
    if (!currentTask) return;

    this.workLogService.getTaskSummary(currentTask.id).subscribe({
      next: (summary) => {
        this.timeSummary.set(summary);
      }
    });
  }

  /**
   * Get time tracking percentage
   */
  getTimePercentage(): number {
    const task = this.task();
    if (!task || !task.estimatedHours || task.estimatedHours === 0) return 0;

    const percentage = (this.timeSummary().totalLogged / task.estimatedHours) * 100;
    return Math.min(percentage, 100);
  }

  /**
   * Format hours to human readable
   */
  formatTimeHours(hours: number): string {
    return formatHours(hours);
  }

  /**
   * Format work date
   */
  formatWorkDate(date: string): string {
    const workDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const workDateOnly = new Date(workDate.getFullYear(), workDate.getMonth(), workDate.getDate());

    if (workDateOnly.getTime() === today.getTime()) {
      return 'Today';
    } else if (workDateOnly.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return workDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: workDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }
}
