import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sprint, CreateSprintDto, UpdateSprintDto, SprintStatus, PaginatedResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private apiUrl = `${environment.apiUrl}/sprints`;

  constructor(private http: HttpClient) {}

  /**
   * Get all sprints with optional filters
   */
  findAll(filters?: {
    status?: SprintStatus;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Sprint>> {
    let params = new HttpParams();

    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.page !== undefined) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.limit !== undefined) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedResponse<Sprint>>(this.apiUrl, { params });
  }

  /**
   * Get active sprint
   */
  getActiveSprint(): Observable<Sprint | null> {
    return this.http.get<Sprint | null>(`${this.apiUrl}/active`);
  }

  /**
   * Get sprint by ID
   */
  findOne(id: number): Observable<Sprint> {
    return this.http.get<Sprint>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new sprint
   */
  create(createSprintDto: CreateSprintDto): Observable<Sprint> {
    return this.http.post<Sprint>(this.apiUrl, createSprintDto);
  }

  /**
   * Update an existing sprint
   */
  update(id: number, updateSprintDto: UpdateSprintDto): Observable<Sprint> {
    return this.http.patch<Sprint>(`${this.apiUrl}/${id}`, updateSprintDto);
  }

  /**
   * Delete a sprint
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Start a sprint (change status to active)
   */
  startSprint(id: number): Observable<Sprint> {
    return this.http.post<Sprint>(`${this.apiUrl}/${id}/start`, {});
  }

  /**
   * Complete a sprint (change status to completed)
   */
  completeSprint(id: number): Observable<Sprint> {
    return this.http.post<Sprint>(`${this.apiUrl}/${id}/complete`, {});
  }

  /**
   * Assign task to sprint
   */
  assignTaskToSprint(sprintId: number, taskId: number | string): Observable<{message: string; task: any}> {
    return this.http.post<{message: string; task: any}>(`${this.apiUrl}/${sprintId}/tasks/${taskId}`, {});
  }

  /**
   * Remove task from sprint
   */
  removeTaskFromSprint(sprintId: number, taskId: number | string): Observable<{message: string; task: any}> {
    return this.http.delete<{message: string; task: any}>(`${this.apiUrl}/${sprintId}/tasks/${taskId}`);
  }

  /**
   * Get tasks in sprint
   */
  getSprintTasks(sprintId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${sprintId}/tasks`);
  }

  /**
   * Get sprint details with tasks included
   */
  getSprintDetails(sprintId: number): Observable<Sprint & {tasks: any[]}> {
    return this.http.get<Sprint & {tasks: any[]}>(`${this.apiUrl}/${sprintId}/details`);
  }
}
