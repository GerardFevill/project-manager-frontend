import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WorkLog, CreateWorkLogDto, UpdateWorkLogDto, TimeTrackingSummary } from '../models';

/**
 * WorkLog Service - Handles all time tracking API calls
 */
@Injectable({
  providedIn: 'root'
})
export class WorkLogService {
  private readonly apiUrl = `${environment.apiUrl}/work-logs`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new work log entry
   */
  create(createDto: CreateWorkLogDto): Observable<WorkLog> {
    return this.http.post<WorkLog>(this.apiUrl, createDto);
  }

  /**
   * Get all work logs for a task
   */
  findByTask(taskId: string): Observable<WorkLog[]> {
    const params = new HttpParams().set('taskId', taskId);
    return this.http.get<WorkLog[]>(this.apiUrl, { params });
  }

  /**
   * Get all work logs by a user
   */
  findByUser(userId: string): Observable<WorkLog[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<WorkLog[]>(this.apiUrl, { params });
  }

  /**
   * Get a single work log by ID
   */
  findOne(id: string): Observable<WorkLog> {
    return this.http.get<WorkLog>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update a work log
   */
  update(id: string, updateDto: UpdateWorkLogDto, userId: string): Observable<WorkLog> {
    const params = new HttpParams().set('userId', userId);
    return this.http.put<WorkLog>(`${this.apiUrl}/${id}`, updateDto, { params });
  }

  /**
   * Delete a work log
   */
  remove(id: string, userId: string): Observable<void> {
    const params = new HttpParams().set('userId', userId);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }

  /**
   * Get total time logged for a task
   */
  getTotalTime(taskId: string): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.apiUrl}/task/${taskId}/total`);
  }

  /**
   * Get time tracking summary for a task
   */
  getTaskSummary(taskId: string): Observable<TimeTrackingSummary> {
    return this.http.get<TimeTrackingSummary>(`${this.apiUrl}/task/${taskId}/summary`);
  }
}
