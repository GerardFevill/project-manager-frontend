import { Component, Input, Output, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Comment } from '../../../core/models';
import { UserAvatarComponent } from '../user-avatar/user-avatar';

/**
 * Task Comment Component - Jira-style comment display and editing
 */
@Component({
  selector: 'app-task-comment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    UserAvatarComponent
  ],
  template: `
    <div class="comment-item">
      <app-user-avatar
        [user]="comment.author || null"
        size="medium"
        class="comment-avatar">
      </app-user-avatar>

      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">
            {{ comment.author ? (comment.author.firstName + ' ' + comment.author.lastName) : 'Unknown User' }}
          </span>
          <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
          @if (comment.isEdited) {
            <span class="comment-edited">(edited)</span>
          }

          @if (canEdit) {
            <button mat-icon-button [matMenuTriggerFor]="menu" class="comment-menu">
              <mat-icon>more_horiz</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="startEdit()">
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>
              <button mat-menu-item (click)="onDelete()">
                <mat-icon>delete</mat-icon>
                <span>Delete</span>
              </button>
            </mat-menu>
          }
        </div>

        @if (isEditing()) {
          <div class="comment-edit">
            <textarea
              [(ngModel)]="editContent"
              class="comment-textarea"
              rows="3"
              placeholder="Add your comment...">
            </textarea>
            <div class="comment-actions">
              <button mat-raised-button color="primary" (click)="saveEdit()" [disabled]="!editContent.trim()">
                Save
              </button>
              <button mat-button (click)="cancelEdit()">
                Cancel
              </button>
            </div>
          </div>
        } @else {
          <div class="comment-body">{{ comment.content }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .comment-item {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f4f5f7;

      &:last-child {
        border-bottom: none;
      }

      .comment-avatar {
        flex-shrink: 0;
      }

      .comment-content {
        flex: 1;
        min-width: 0;

        .comment-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .comment-author {
            font-size: 14px;
            font-weight: 600;
            color: #172b4d;
          }

          .comment-time {
            font-size: 12px;
            color: #97a0af;
          }

          .comment-edited {
            font-size: 11px;
            color: #97a0af;
            font-style: italic;
          }

          .comment-menu {
            margin-left: auto;
            width: 28px;
            height: 28px;
            line-height: 28px;

            mat-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
            }
          }
        }

        .comment-body {
          font-size: 14px;
          line-height: 20px;
          color: #172b4d;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .comment-edit {
          .comment-textarea {
            width: 100%;
            padding: 8px 12px;
            border: 2px solid #dfe1e6;
            border-radius: 3px;
            font-family: inherit;
            font-size: 14px;
            color: #172b4d;
            resize: vertical;
            transition: border-color 0.15s ease;

            &:focus {
              outline: none;
              border-color: #0052cc;
            }
          }

          .comment-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;

            button {
              text-transform: none;
              font-weight: 500;
              height: 32px;
            }
          }
        }
      }
    }

    html.dark-mode {
      .comment-item {
        border-color: #2c333a;

        .comment-content {
          .comment-header {
            .comment-author {
              color: #b6c2cf;
            }

            .comment-time,
            .comment-edited {
              color: #9fadbc;
            }
          }

          .comment-body {
            color: #b6c2cf;
          }

          .comment-edit .comment-textarea {
            background: #22272b;
            border-color: #2c333a;
            color: #b6c2cf;

            &:focus {
              border-color: #0052cc;
            }
          }
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCommentComponent {
  @Input({required: true}) comment!: Comment;
  @Input() canEdit: boolean = false;
  @Output() edit = new EventEmitter<{ id: string; content: string }>();
  @Output() delete = new EventEmitter<string>();

  isEditing = signal(false);
  editContent = '';

  startEdit() {
    this.editContent = this.comment.content;
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.editContent = '';
    this.isEditing.set(false);
  }

  saveEdit() {
    if (this.editContent.trim()) {
      this.edit.emit({ id: this.comment.id, content: this.editContent });
      this.isEditing.set(false);
    }
  }

  onDelete() {
    this.delete.emit(this.comment.id);
  }

  formatTime(date: string): string {
    const now = new Date();
    const commentDate = new Date(date);
    const diff = now.getTime() - commentDate.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return commentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: commentDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
