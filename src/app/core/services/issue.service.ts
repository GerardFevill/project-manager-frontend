import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from './user.service';

// Re-export User for backwards compatibility
export type { User } from './user.service';

export interface Issue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assignee?: User;
  reporter: User;
  labels?: string[];
  sprint?: Sprint;
  project: Project;
  storyPoints?: number;
  timeEstimate?: number;
  timeSpent?: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type IssueStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
export type IssuePriority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';
export type IssueType = 'story' | 'task' | 'bug' | 'epic' | 'subtask';

export interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed';
}

export interface Project {
  id: string;
  key: string;
  name: string;
}

export interface IssueFilters {
  status?: IssueStatus[];
  priority?: IssuePriority[];
  type?: IssueType[];
  assignee?: string[];
  reporter?: string[];
  labels?: string[];
  sprint?: string;
  project?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateIssueDto {
  type: IssueType;
  summary: string;
  description?: string;
  priority: IssuePriority;
  assigneeId?: string;
  sprintId?: string;
  storyPoints?: number;
  timeEstimate?: number;
  labels?: string[];
}

export interface UpdateIssueDto {
  type?: IssueType;
  summary?: string;
  description?: string;
  priority?: IssuePriority;
  status?: IssueStatus;
  assigneeId?: string;
  sprintId?: string;
  storyPoints?: number;
  timeEstimate?: number;
  labels?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private readonly API_URL = `${environment.apiUrl}/issues`;

  // Signals for reactive state
  issues = signal<Issue[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Cache for quick access
  private issuesCache = new Map<string, Issue>();

  constructor(private http: HttpClient) {}

  /**
   * Get all issues with optional filters
   */
  getIssues(filters?: IssueFilters, page = 1, pageSize = 50): Observable<PaginatedResponse<Issue>> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters) {
      if (filters.status?.length) {
        params = params.set('status', filters.status.join(','));
      }
      if (filters.priority?.length) {
        params = params.set('priority', filters.priority.join(','));
      }
      if (filters.type?.length) {
        params = params.set('type', filters.type.join(','));
      }
      if (filters.assignee?.length) {
        params = params.set('assignee', filters.assignee.join(','));
      }
      if (filters.sprint) {
        params = params.set('sprint', filters.sprint);
      }
      if (filters.project) {
        params = params.set('project', filters.project);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }

    return this.http.get<PaginatedResponse<Issue>>(this.API_URL, { params }).pipe(
      tap(response => {
        this.issues.set(response.items);
        // Update cache
        response.items.forEach(issue => this.issuesCache.set(issue.id, issue));
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load issues');
        this.loading.set(false);
        console.error('Error loading issues:', error);
        return of({ items: [], total: 0, page: 1, pageSize });
      })
    );
  }

  /**
   * Get a single issue by ID
   */
  getIssue(id: string): Observable<Issue> {
    // Check cache first
    const cached = this.issuesCache.get(id);
    if (cached) {
      return of(cached);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Issue>(`${this.API_URL}/${id}`).pipe(
      tap(issue => {
        this.issuesCache.set(issue.id, issue);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load issue');
        this.loading.set(false);
        console.error('Error loading issue:', error);
        throw error;
      })
    );
  }

  /**
   * Get issues assigned to current user
   */
  getMyIssues(limit = 10): Observable<Issue[]> {
    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams()
      .set('assignee', 'currentUser')
      .set('status', 'todo,in-progress,review')
      .set('pageSize', limit.toString());

    return this.http.get<PaginatedResponse<Issue>>(this.API_URL, { params }).pipe(
      tap(response => {
        this.loading.set(false);
        response.items.forEach(issue => this.issuesCache.set(issue.id, issue));
      }),
      map(response => response.items),
      catchError(error => {
        this.error.set('Failed to load my issues');
        this.loading.set(false);
        console.error('Error loading my issues:', error);
        return of([]);
      })
    );
  }

  /**
   * Create a new issue
   */
  createIssue(dto: CreateIssueDto): Observable<Issue> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<Issue>(this.API_URL, dto).pipe(
      tap(newIssue => {
        this.issuesCache.set(newIssue.id, newIssue);
        this.issues.update(issues => [...issues, newIssue]);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to create issue');
        this.loading.set(false);
        console.error('Error creating issue:', error);
        throw error;
      })
    );
  }

  /**
   * Update an existing issue
   */
  updateIssue(id: string, dto: UpdateIssueDto): Observable<Issue> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.patch<Issue>(`${this.API_URL}/${id}`, dto).pipe(
      tap(updatedIssue => {
        this.issuesCache.set(updatedIssue.id, updatedIssue);
        this.issues.update(issues =>
          issues.map(issue => issue.id === id ? updatedIssue : issue)
        );
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to update issue');
        this.loading.set(false);
        console.error('Error updating issue:', error);
        throw error;
      })
    );
  }

  /**
   * Delete an issue
   */
  deleteIssue(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.issuesCache.delete(id);
        this.issues.update(issues => issues.filter(issue => issue.id !== id));
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to delete issue');
        this.loading.set(false);
        console.error('Error deleting issue:', error);
        throw error;
      })
    );
  }

  /**
   * Transition issue to a new status
   */
  transitionIssue(id: string, status: IssueStatus): Observable<Issue> {
    return this.updateIssue(id, { status });
  }

  /**
   * Assign issue to user
   */
  assignIssue(id: string, userId: string): Observable<Issue> {
    return this.http.post<Issue>(`${this.API_URL}/${id}/assign`, { userId }).pipe(
      tap(updatedIssue => {
        this.issuesCache.set(updatedIssue.id, updatedIssue);
        this.issues.update(issues =>
          issues.map(issue => issue.id === id ? updatedIssue : issue)
        );
      }),
      catchError(error => {
        console.error('Error assigning issue:', error);
        throw error;
      })
    );
  }

  /**
   * Get issue count by status
   */
  getIssueCountByStatus(): Observable<Record<IssueStatus, number>> {
    return this.http.get<Record<IssueStatus, number>>(`${this.API_URL}/count/by-status`).pipe(
      catchError(error => {
        console.error('Error getting issue counts:', error);
        return of({
          'todo': 0,
          'in-progress': 0,
          'review': 0,
          'done': 0,
          'blocked': 0
        });
      })
    );
  }

  /**
   * Get issue count by priority
   */
  getIssueCountByPriority(): Observable<Record<IssuePriority, number>> {
    return this.http.get<Record<IssuePriority, number>>(`${this.API_URL}/count/by-priority`).pipe(
      catchError(error => {
        console.error('Error getting priority counts:', error);
        return of({
          'highest': 0,
          'high': 0,
          'medium': 0,
          'low': 0,
          'lowest': 0
        });
      })
    );
  }

  /**
   * Get issue count by type
   */
  getIssueCountByType(): Observable<Record<IssueType, number>> {
    return this.http.get<Record<IssueType, number>>(`${this.API_URL}/count/by-type`).pipe(
      catchError(error => {
        console.error('Error getting type counts:', error);
        return of({
          'story': 0,
          'task': 0,
          'bug': 0,
          'epic': 0,
          'subtask': 0
        });
      })
    );
  }

  /**
   * Get issue detail with all relations (for detail view)
   * This bypasses cache to ensure fresh data
   */
  getIssueDetail(id: string): Observable<Issue> {
    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams().set('include', 'all');

    return this.http.get<Issue>(`${this.API_URL}/${id}`, { params }).pipe(
      tap(issue => {
        this.issuesCache.set(issue.id, issue);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load issue detail');
        this.loading.set(false);
        console.error('Error loading issue detail:', error);
        throw error;
      })
    );
  }

  /**
   * Refresh an issue from the backend (bypass cache)
   */
  refreshIssue(id: string): Observable<Issue> {
    this.issuesCache.delete(id);
    return this.getIssue(id);
  }

  /**
   * Invalidate cache for a specific issue
   */
  invalidateCache(id: string): void {
    this.issuesCache.delete(id);
  }

  /**
   * Get issue from cache if available
   */
  getCachedIssue(id: string): Issue | undefined {
    return this.issuesCache.get(id);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.issuesCache.clear();
    this.issues.set([]);
  }
}
