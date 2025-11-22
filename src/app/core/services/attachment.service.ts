import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Attachment,
  AttachmentListResponse,
  AttachmentUploadProgress
} from '../models/attachment.model';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private apiUrl = `${environment.apiUrl}/issues`;
  private attachmentsCache = new Map<string, BehaviorSubject<Attachment[]>>();

  constructor(private http: HttpClient) {}

  /**
   * Get all attachments for an issue
   */
  getAttachments(issueId: string): Observable<AttachmentListResponse> {
    return this.http.get<AttachmentListResponse>(
      `${this.apiUrl}/${issueId}/attachments`
    ).pipe(
      tap(response => {
        // Update cache
        if (!this.attachmentsCache.has(issueId)) {
          this.attachmentsCache.set(issueId, new BehaviorSubject<Attachment[]>([]));
        }
        this.attachmentsCache.get(issueId)!.next(response.items);
      })
    );
  }

  /**
   * Upload an attachment with progress tracking
   */
  uploadAttachment(issueId: string, file: File): Observable<number | Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.apiUrl}/${issueId}/attachments`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request<Attachment>(req).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          // Calculate progress percentage
          const progress = event.total
            ? Math.round((100 * event.loaded) / event.total)
            : 0;
          return progress;
        } else if (event.type === HttpEventType.Response) {
          // Upload complete, return the attachment
          const attachment = event.body as Attachment;

          // Add to cache
          if (this.attachmentsCache.has(issueId)) {
            const current = this.attachmentsCache.get(issueId)!.value;
            this.attachmentsCache.get(issueId)!.next([...current, attachment]);
          }

          return attachment;
        }

        // For other event types, return current progress
        return 0;
      })
    );
  }

  /**
   * Upload multiple attachments
   */
  uploadMultipleAttachments(
    issueId: string,
    files: File[]
  ): Observable<AttachmentUploadProgress[]> {
    const progress$ = new BehaviorSubject<AttachmentUploadProgress[]>(
      files.map(file => ({
        file,
        progress: 0,
        uploaded: false
      }))
    );

    files.forEach((file, index) => {
      this.uploadAttachment(issueId, file).subscribe({
        next: (result) => {
          const current = progress$.value;

          if (typeof result === 'number') {
            // Progress update
            current[index].progress = result;
          } else {
            // Upload complete
            current[index].progress = 100;
            current[index].uploaded = true;
          }

          progress$.next([...current]);
        },
        error: (err) => {
          const current = progress$.value;
          current[index].error = err.message || 'Upload failed';
          progress$.next([...current]);
        }
      });
    });

    return progress$.asObservable();
  }

  /**
   * Delete an attachment
   */
  deleteAttachment(issueId: string, attachmentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${issueId}/attachments/${attachmentId}`
    ).pipe(
      tap(() => {
        // Remove from cache
        if (this.attachmentsCache.has(issueId)) {
          const current = this.attachmentsCache.get(issueId)!.value;
          const filtered = current.filter(a => a.id !== attachmentId);
          this.attachmentsCache.get(issueId)!.next(filtered);
        }
      })
    );
  }

  /**
   * Download an attachment
   */
  downloadAttachment(attachment: Attachment): void {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get cached attachments for an issue (as observable)
   */
  getCachedAttachments(issueId: string): Observable<Attachment[]> {
    if (!this.attachmentsCache.has(issueId)) {
      this.attachmentsCache.set(issueId, new BehaviorSubject<Attachment[]>([]));
    }
    return this.attachmentsCache.get(issueId)!.asObservable();
  }

  /**
   * Get file icon based on mime type
   */
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    return 'file';
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validate file size
   */
  validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
  }

  /**
   * Validate file type
   */
  validateFileType(file: File, allowedTypes: string[] = []): boolean {
    if (allowedTypes.length === 0) return true;
    return allowedTypes.some(type => file.type.includes(type));
  }

  /**
   * Clear cache for an issue
   */
  clearCache(issueId: string): void {
    this.attachmentsCache.delete(issueId);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.attachmentsCache.clear();
  }
}
