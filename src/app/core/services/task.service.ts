import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto, TaskFilterDto, TaskStats } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  findAll(filters?: TaskFilterDto): Observable<Task[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.onlyOverdue !== undefined) params = params.set('onlyOverdue', filters.onlyOverdue.toString());
      if (filters.onlyRoot !== undefined) params = params.set('onlyRoot', filters.onlyRoot.toString());
      if (filters.parentId) params = params.set('parentId', filters.parentId);
    }

    return this.http.get<Task[]>(this.apiUrl, { params });
  }

  findOne(id: string, includeRelations = false): Observable<Task> {
    let params = new HttpParams();
    if (includeRelations) {
      params = params.set('includeRelations', 'true');
    }
    return this.http.get<Task>(`${this.apiUrl}/${id}`, { params });
  }

  findChildren(id: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/${id}/children`);
  }

  findTree(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}/tree`);
  }

  getStats(): Observable<TaskStats> {
    return this.http.get<TaskStats>(`${this.apiUrl}/stats`);
  }

  create(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  update(id: string, task: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, task);
  }

  toggle(id: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/toggle`, {});
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
