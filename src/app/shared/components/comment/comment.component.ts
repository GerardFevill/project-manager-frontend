import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { Comment } from '../../../core/models/comment.model';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, AvatarComponent],
  template: `
    <div class="comment" [class.editing]="isEditing()">
      <jira-avatar
        [name]="comment.author.name"
        [src]="comment.author.avatar"
        size="medium"
      />

      <div class="comment-content">
        <div class="comment-header">
          <span class="author-name">{{ comment.author.name }}</span>
          <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
          <span *ngIf="comment.edited" class="edited-badge">(edited)</span>

          <div class="comment-actions" *ngIf="canEdit()">
            <button
              *ngIf="!isEditing()"
              class="action-btn"
              (click)="startEdit()"
              title="Edit"
            >
              <jira-icon name="edit" [size]="14" />
            </button>
            <button
              class="action-btn delete"
              (click)="onDelete()"
              title="Delete"
            >
              <jira-icon name="delete" [size]="14" />
            </button>
          </div>
        </div>

        <div class="comment-body" *ngIf="!isEditing()">
          <p>{{ comment.body }}</p>
        </div>

        <div class="comment-edit-form" *ngIf="isEditing()">
          <textarea
            [(ngModel)]="editedBody"
            class="edit-textarea"
            rows="3"
            placeholder="Edit your comment..."
            (keydown.ctrl.enter)="saveEdit()"
            (keydown.escape)="cancelEdit()"
          ></textarea>

          <div class="edit-actions">
            <button class="btn btn-primary" (click)="saveEdit()" [disabled]="!editedBody.trim()">
              Save
            </button>
            <button class="btn btn-subtle" (click)="cancelEdit()">
              Cancel
            </button>
            <span class="edit-hint">Ctrl+Enter to save</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .comment {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      transition: background var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-50);
      }

      &.editing {
        background: var(--jira-neutral-100);
      }
    }

    .comment-content {
      flex: 1;
      min-width: 0;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-xs);
    }

    .author-name {
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      font-size: var(--font-size-sm);
    }

    .comment-time {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
    }

    .edited-badge {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-500);
      font-style: italic;
    }

    .comment-actions {
      margin-left: auto;
      display: flex;
      gap: var(--spacing-xs);
      opacity: 0;
      transition: opacity var(--transition-fast);
    }

    .comment:hover .comment-actions {
      opacity: 1;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-700);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-200);
        color: var(--jira-neutral-1000);
      }

      &.delete:hover {
        background: var(--jira-danger-bg);
        color: var(--jira-danger);
      }
    }

    .comment-body {
      p {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--jira-neutral-800);
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
      }
    }

    .comment-edit-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .edit-textarea {
      width: 100%;
      padding: var(--spacing-sm);
      border: 1px solid var(--jira-brand-primary);
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-1000);
      resize: vertical;
      min-height: 60px;

      &:focus {
        outline: none;
        border-color: var(--jira-brand-primary);
        box-shadow: 0 0 0 1px var(--jira-brand-primary);
      }
    }

    .edit-actions {
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

    .edit-hint {
      margin-left: auto;
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-600);
    }
  `]
})
export class CommentComponent {
  @Input() comment!: Comment;
  @Input() currentUserId?: string;
  @Output() edit = new EventEmitter<{ id: string; body: string }>();
  @Output() delete = new EventEmitter<string>();

  isEditing = signal(false);
  editedBody = '';

  canEdit(): boolean {
    return !!this.currentUserId && this.comment.author.id === this.currentUserId;
  }

  startEdit(): void {
    this.editedBody = this.comment.body;
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.editedBody = '';
    this.isEditing.set(false);
  }

  saveEdit(): void {
    if (!this.editedBody.trim()) return;

    this.edit.emit({
      id: this.comment.id,
      body: this.editedBody.trim()
    });

    this.isEditing.set(false);
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.delete.emit(this.comment.id);
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return commentDate.toLocaleDateString();
  }
}
