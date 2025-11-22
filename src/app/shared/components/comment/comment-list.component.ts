import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { CommentComponent } from './comment.component';
import { CommentService } from '../../../core/services/comment.service';
import { Comment } from '../../../core/models/comment.model';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, CommentComponent],
  template: `
    <div class="comment-list">
      <div class="comment-list-header">
        <h3>Comments ({{ comments().length }})</h3>
      </div>

      <!-- Add Comment Form -->
      <div class="add-comment-form">
        <textarea
          [(ngModel)]="newCommentBody"
          class="comment-textarea"
          placeholder="Add a comment..."
          rows="3"
          (keydown.ctrl.enter)="addComment()"
        ></textarea>
        <div class="form-actions">
          <button
            class="btn btn-primary"
            (click)="addComment()"
            [disabled]="!newCommentBody.trim() || submitting()"
          >
            <span *ngIf="!submitting()">Add Comment</span>
            <span *ngIf="submitting()">Adding...</span>
          </button>
          <span class="hint">Ctrl+Enter to submit</span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading-state">
        <div class="spinner"></div>
        <p>Loading comments...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="error-state">
        <jira-icon name="warning" [size]="32" color="var(--jira-danger)" />
        <p>{{ error() }}</p>
        <button class="btn btn-subtle" (click)="loadComments()">
          Retry
        </button>
      </div>

      <!-- Comments List -->
      <div *ngIf="!loading() && !error()" class="comments-container">
        <div *ngIf="comments().length === 0" class="empty-state">
          <jira-icon name="comment" [size]="48" color="var(--jira-neutral-400)" />
          <p>No comments yet</p>
          <span>Be the first to comment on this issue</span>
        </div>

        <app-comment
          *ngFor="let comment of comments(); trackBy: trackByComment"
          [comment]="comment"
          [currentUserId]="currentUserId"
          (edit)="onEditComment($event)"
          (delete)="onDeleteComment($event)"
        />
      </div>
    </div>
  `,
  styles: [`
    .comment-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .comment-list-header {
      h3 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--jira-neutral-1000);
        margin: 0;
      }
    }

    .add-comment-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: var(--jira-neutral-50);
      border-radius: var(--radius-md);
      border: 1px solid var(--jira-neutral-200);
    }

    .comment-textarea {
      width: 100%;
      padding: var(--spacing-sm);
      border: 1px solid var(--jira-neutral-300);
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-1000);
      background: var(--jira-neutral-0);
      resize: vertical;
      min-height: 80px;

      &:focus {
        outline: none;
        border-color: var(--jira-brand-primary);
        box-shadow: 0 0 0 1px var(--jira-brand-primary);
      }

      &::placeholder {
        color: var(--jira-neutral-500);
      }
    }

    .form-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .btn {
      padding: var(--spacing-xs) var(--spacing-md);
      border: none;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-fast);

      &.btn-primary {
        background: var(--jira-brand-primary);
        color: white;

        &:hover:not(:disabled) {
          background: var(--jira-brand-hover);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      &.btn-subtle {
        background: transparent;
        color: var(--jira-neutral-700);

        &:hover {
          background: var(--jira-neutral-200);
        }
      }
    }

    .hint {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
    }

    .loading-state,
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-2xl);
      text-align: center;
      gap: var(--spacing-md);

      p {
        font-size: var(--font-size-sm);
        color: var(--jira-neutral-600);
        margin: 0;
      }
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--jira-neutral-200);
      border-top-color: var(--jira-brand-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .comments-container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;
      gap: var(--spacing-sm);

      p {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--jira-neutral-800);
        margin: 0;
      }

      span {
        font-size: var(--font-size-sm);
        color: var(--jira-neutral-600);
      }
    }
  `]
})
export class CommentListComponent implements OnInit, OnDestroy {
  @Input() issueId!: string;
  @Input() currentUserId?: string;

  private destroy$ = new Subject<void>();

  comments = signal<Comment[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);

  newCommentBody = '';

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadComments(): void {
    this.loading.set(true);
    this.error.set(null);

    this.commentService.getComments(this.issueId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.comments.set(response.items);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading comments:', err);
          this.error.set('Failed to load comments. Please try again.');
          this.loading.set(false);
        }
      });
  }

  addComment(): void {
    if (!this.newCommentBody.trim()) return;

    this.submitting.set(true);

    this.commentService.createComment(this.issueId, {
      body: this.newCommentBody.trim()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comment) => {
          this.comments.update(comments => [...comments, comment]);
          this.newCommentBody = '';
          this.submitting.set(false);
        },
        error: (err) => {
          console.error('Error adding comment:', err);
          alert('Failed to add comment. Please try again.');
          this.submitting.set(false);
        }
      });
  }

  onEditComment(event: { id: string; body: string }): void {
    this.commentService.updateComment(this.issueId, event.id, {
      body: event.body
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedComment) => {
          this.comments.update(comments =>
            comments.map(c => c.id === event.id ? updatedComment : c)
          );
        },
        error: (err) => {
          console.error('Error updating comment:', err);
          alert('Failed to update comment. Please try again.');
        }
      });
  }

  onDeleteComment(commentId: string): void {
    this.commentService.deleteComment(this.issueId, commentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.comments.update(comments =>
            comments.filter(c => c.id !== commentId)
          );
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
          alert('Failed to delete comment. Please try again.');
        }
      });
  }

  trackByComment(index: number, comment: Comment): string {
    return comment.id;
  }
}
