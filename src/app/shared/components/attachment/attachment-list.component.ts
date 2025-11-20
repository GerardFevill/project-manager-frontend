import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { AttachmentService } from '../../../core/services/attachment.service';
import { Attachment } from '../../../core/models/attachment.model';

@Component({
  selector: 'app-attachment-list',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="attachment-list">
      <div class="list-header">
        <h3>Attachments ({{ attachments().length }})</h3>
        <input
          #fileInput
          type="file"
          multiple
          (change)="onFilesSelected($event)"
          style="display: none"
        />
        <button class="btn btn-primary" (click)="fileInput.click()" [disabled]="uploading()">
          <jira-icon leftIcon name="plus" [size]="14" />
          {{ uploading() ? 'Uploading...' : 'Add Files' }}
        </button>
      </div>

      <div *ngIf="loading()" class="loading-state">
        <div class="spinner"></div>
        <p>Loading attachments...</p>
      </div>

      <div *ngIf="attachments().length === 0 && !loading()" class="empty-state">
        <jira-icon name="attachment" [size]="48" color="var(--jira-neutral-400)" />
        <p>No attachments yet</p>
      </div>

      <div class="attachments-grid">
        <div *ngFor="let attachment of attachments()" class="attachment-item">
          <div class="attachment-preview">
            <img *ngIf="isImage(attachment)" [src]="attachment.url" [alt]="attachment.originalName" />
            <jira-icon *ngIf="!isImage(attachment)" name="attachment" [size]="32" />
          </div>
          <div class="attachment-info">
            <span class="file-name" [title]="attachment.originalName">{{ attachment.originalName }}</span>
            <span class="file-size">{{ formatSize(attachment.size) }}</span>
          </div>
          <div class="attachment-actions">
            <button class="action-btn" (click)="download(attachment)" title="Download">
              <jira-icon name="arrow-down" [size]="14" />
            </button>
            <button class="action-btn delete" (click)="deleteAttachment(attachment)" title="Delete">
              <jira-icon name="delete" [size]="14" />
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .attachment-list { display: flex; flex-direction: column; gap: var(--spacing-md); }
    .list-header { display: flex; justify-content: space-between; align-items: center; }
    .list-header h3 { margin: 0; font-size: var(--font-size-lg); }
    .btn { padding: var(--spacing-xs) var(--spacing-md); border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); }
    .btn-primary { background: var(--jira-brand-primary); color: white; }
    .btn-primary:hover:not(:disabled) { background: var(--jira-brand-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--spacing-2xl); text-align: center; gap: var(--spacing-md); }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--jira-neutral-200); border-top-color: var(--jira-brand-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .attachments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--spacing-md); }
    .attachment-item { display: flex; flex-direction: column; padding: var(--spacing-md); border: 1px solid var(--jira-neutral-200); border-radius: var(--radius-md); gap: var(--spacing-sm); }
    .attachment-preview { width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; background: var(--jira-neutral-100); border-radius: var(--radius-sm); overflow: hidden; }
    .attachment-preview img { width: 100%; height: 100%; object-fit: cover; }
    .attachment-info { display: flex; flex-direction: column; gap: 4px; }
    .file-name { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file-size { font-size: var(--font-size-xs); color: var(--jira-neutral-600); }
    .attachment-actions { display: flex; gap: var(--spacing-xs); }
    .action-btn { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: none; background: transparent; border-radius: var(--radius-sm); cursor: pointer; }
    .action-btn:hover { background: var(--jira-neutral-200); }
    .action-btn.delete:hover { background: var(--jira-danger-bg); color: var(--jira-danger); }
  `]
})
export class AttachmentListComponent implements OnInit, OnDestroy {
  @Input() issueId!: string;
  private destroy$ = new Subject<void>();
  attachments = signal<Attachment[]>([]);
  loading = signal(true);
  uploading = signal(false);

  constructor(private attachmentService: AttachmentService) {}

  ngOnInit(): void {
    this.loadAttachments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAttachments(): void {
    this.loading.set(true);
    this.attachmentService.getAttachments(this.issueId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.attachments.set(response.items);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  onFilesSelected(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    if (!files.length) return;

    this.uploading.set(true);
    files.forEach(file => {
      this.attachmentService.uploadAttachment(this.issueId, file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (typeof result !== 'number') {
              this.attachments.update(atts => [...atts, result]);
            }
          },
          error: () => alert('Upload failed'),
          complete: () => this.uploading.set(false)
        });
    });
  }

  deleteAttachment(attachment: Attachment): void {
    if (!confirm(`Delete ${attachment.originalName}?`)) return;
    this.attachmentService.deleteAttachment(this.issueId, attachment.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.attachments.update(atts => atts.filter(a => a.id !== attachment.id)),
        error: () => alert('Delete failed')
      });
  }

  download(attachment: Attachment): void {
    this.attachmentService.downloadAttachment(attachment);
  }

  isImage(attachment: Attachment): boolean {
    return attachment.mimeType.startsWith('image/');
  }

  formatSize(bytes: number): string {
    return this.attachmentService.formatFileSize(bytes);
  }
}
