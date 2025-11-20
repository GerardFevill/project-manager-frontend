import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
  CommentListResponse
} from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/issues`;
  private commentsCache = new Map<string, BehaviorSubject<Comment[]>>();

  constructor(private http: HttpClient) {}

  /**
   * Get all comments for an issue
   */
  getComments(issueId: string, page = 1, pageSize = 50): Observable<CommentListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<CommentListResponse>(
      `${this.apiUrl}/${issueId}/comments`,
      { params }
    ).pipe(
      tap(response => {
        // Update cache
        if (!this.commentsCache.has(issueId)) {
          this.commentsCache.set(issueId, new BehaviorSubject<Comment[]>([]));
        }
        this.commentsCache.get(issueId)!.next(response.items);
      })
    );
  }

  /**
   * Get a single comment
   */
  getComment(issueId: string, commentId: string): Observable<Comment> {
    return this.http.get<Comment>(
      `${this.apiUrl}/${issueId}/comments/${commentId}`
    );
  }

  /**
   * Create a new comment
   */
  createComment(issueId: string, dto: CreateCommentDto): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.apiUrl}/${issueId}/comments`,
      dto
    ).pipe(
      tap(comment => {
        // Add to cache
        if (this.commentsCache.has(issueId)) {
          const current = this.commentsCache.get(issueId)!.value;
          this.commentsCache.get(issueId)!.next([...current, comment]);
        }
      })
    );
  }

  /**
   * Update an existing comment
   */
  updateComment(
    issueId: string,
    commentId: string,
    dto: UpdateCommentDto
  ): Observable<Comment> {
    return this.http.patch<Comment>(
      `${this.apiUrl}/${issueId}/comments/${commentId}`,
      dto
    ).pipe(
      tap(updatedComment => {
        // Update cache
        if (this.commentsCache.has(issueId)) {
          const current = this.commentsCache.get(issueId)!.value;
          const updated = current.map(c =>
            c.id === commentId ? updatedComment : c
          );
          this.commentsCache.get(issueId)!.next(updated);
        }
      })
    );
  }

  /**
   * Delete a comment
   */
  deleteComment(issueId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${issueId}/comments/${commentId}`
    ).pipe(
      tap(() => {
        // Remove from cache
        if (this.commentsCache.has(issueId)) {
          const current = this.commentsCache.get(issueId)!.value;
          const filtered = current.filter(c => c.id !== commentId);
          this.commentsCache.get(issueId)!.next(filtered);
        }
      })
    );
  }

  /**
   * Get cached comments for an issue (as observable)
   */
  getCachedComments(issueId: string): Observable<Comment[]> {
    if (!this.commentsCache.has(issueId)) {
      this.commentsCache.set(issueId, new BehaviorSubject<Comment[]>([]));
    }
    return this.commentsCache.get(issueId)!.asObservable();
  }

  /**
   * Clear cache for an issue
   */
  clearCache(issueId: string): void {
    this.commentsCache.delete(issueId);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.commentsCache.clear();
  }
}
