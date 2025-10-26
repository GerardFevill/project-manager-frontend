import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilterDto,
  TaskStats,
  BlockTaskDto,
  TaskHistory,
  TaskProgress
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  // ============================================================================
  // CRUD - Read Operations
  // ============================================================================

  /**
   * Find all tasks with advanced filters
   */
  findAll(filters?: TaskFilterDto): Observable<Task[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.recurrence) params = params.set('recurrence', filters.recurrence);
      if (filters.onlyRoot !== undefined) params = params.set('onlyRoot', filters.onlyRoot.toString());
      if (filters.onlyOverdue !== undefined) params = params.set('onlyOverdue', filters.onlyOverdue.toString());
      if (filters.parentId) params = params.set('parentId', filters.parentId);
      if (filters.tags && filters.tags.length > 0) params = params.set('tags', filters.tags.join(','));
      if (filters.search) params = params.set('search', filters.search);
      if (filters.progressMin !== undefined) params = params.set('progressMin', filters.progressMin.toString());
      if (filters.progressMax !== undefined) params = params.set('progressMax', filters.progressMax.toString());
      if (filters.dueDateMin) params = params.set('dueDateMin', filters.dueDateMin);
      if (filters.dueDateMax) params = params.set('dueDateMax', filters.dueDateMax);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
      if (filters.includeArchived !== undefined) params = params.set('includeArchived', filters.includeArchived.toString());
    }

    return this.http.get<Task[]>(this.apiUrl, { params });
  }

  /**
   * Find one task by ID
   */
  findOne(id: string, includeRelations = false): Observable<Task> {
    let params = new HttpParams();
    if (includeRelations) {
      params = params.set('includeRelations', 'true');
    }
    return this.http.get<Task>(`${this.apiUrl}/${id}`, { params });
  }

  /**
   * Get task statistics
   */
  getStats(): Observable<TaskStats> {
    return this.http.get<TaskStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Get upcoming recurring tasks
   */
  getUpcomingRecurrences(days: number = 7): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/recurring/upcoming`, {
      params: { days: days.toString() }
    });
  }

  // ============================================================================
  // CRUD - Write Operations
  // ============================================================================

  /**
   * Create a new task
   */
  create(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  /**
   * Update an existing task
   */
  update(id: string, task: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, task);
  }

  /**
   * Delete a task (hard delete with cascade)
   */
  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ============================================================================
  // Hierarchical Navigation
  // ============================================================================

  /**
   * Get direct children of a task
   */
  findChildren(id: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/${id}/children`);
  }

  /**
   * Get full task tree (recursive)
   */
  findTree(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}/tree`);
  }

  /**
   * Get all ancestors (parents up to root)
   */
  findAncestors(id: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/${id}/ancestors`);
  }

  // ============================================================================
  // Specialized Actions
  // ============================================================================

  /**
   * Toggle task completion (ACTIVE ↔ COMPLETED)
   */
  toggle(id: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/toggle`, {});
  }

  /**
   * Block a task with optional reason
   */
  blockTask(id: string, reason?: string): Observable<Task> {
    const body: BlockTaskDto = reason ? { reason } : {};
    return this.http.post<Task>(`${this.apiUrl}/${id}/block`, body);
  }

  /**
   * Unblock a task (BLOCKED → ACTIVE)
   */
  unblockTask(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/unblock`, {});
  }

  /**
   * Archive a task (soft delete)
   */
  archiveTask(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/archive`, {});
  }

  /**
   * Restore an archived task
   */
  unarchiveTask(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/unarchive`, {});
  }

  /**
   * Move recurring task to next occurrence
   */
  moveToNextOccurrence(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/next-occurrence`, {});
  }

  /**
   * Recalculate progress from children
   */
  calculateProgressFromChildren(id: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${id}/calculate-progress`, {});
  }

  // ============================================================================
  // Analytics & History
  // ============================================================================

  /**
   * Get task progress details with timeline
   */
  getTaskProgress(id: string): Observable<TaskProgress> {
    return this.http.get<TaskProgress>(`${this.apiUrl}/${id}/progress`);
  }

  /**
   * Get complete task history (audit trail)
   */
  getTaskHistory(id: string): Observable<TaskHistory[]> {
    return this.http.get<TaskHistory[]>(`${this.apiUrl}/${id}/history`);
  }
}
