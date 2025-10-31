import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment, CreateCommentDto, UpdateCommentDto } from '../models';

/**
 * Comment Service - Handles all comment-related API calls
 */
@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new comment
   */
  create(createDto: CreateCommentDto): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, createDto);
  }

  /**
   * Get all comments for a task
   */
  findByTask(taskId: string): Observable<Comment[]> {
    const params = new HttpParams().set('taskId', taskId);
    return this.http.get<Comment[]>(this.apiUrl, { params });
  }

  /**
   * Get a single comment by ID
   */
  findOne(id: string): Observable<Comment> {
    return this.http.get<Comment>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update a comment
   */
  update(id: string, updateDto: UpdateCommentDto, userId: string): Observable<Comment> {
    const params = new HttpParams().set('userId', userId);
    return this.http.put<Comment>(`${this.apiUrl}/${id}`, updateDto, { params });
  }

  /**
   * Delete a comment
   */
  remove(id: string, userId: string): Observable<void> {
    const params = new HttpParams().set('userId', userId);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }

  /**
   * Get comment count for a task
   */
  countByTask(taskId: string): Observable<{ count: number }> {
    const params = new HttpParams().set('taskId', taskId);
    return this.http.get<{ count: number }>(`${this.apiUrl}/count/task`, { params });
  }
}
