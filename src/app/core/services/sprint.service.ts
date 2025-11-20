import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Issue } from './issue.service';

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  projectId: string;
  capacity?: number;
  issues?: Issue[];
  stats?: SprintStats;
  createdAt: Date;
  updatedAt: Date;
}

export type SprintStatus = 'planned' | 'active' | 'completed';

export interface SprintStats {
  totalIssues: number;
  completedIssues: number;
  inProgressIssues: number;
  todoIssues: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  remainingStoryPoints: number;
  velocity?: number;
}

export interface SprintVelocity {
  sprintId: string;
  sprintName: string;
  planned: number;
  completed: number;
  endDate: Date;
}

export interface BurndownData {
  date: Date;
  remaining: number;
  ideal: number;
  completed: number;
}

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private readonly API_URL = `${environment.apiUrl}/sprints`;

  // Signals for reactive state
  sprints = signal<Sprint[]>([]);
  activeSprint = signal<Sprint | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Get all sprints
   */
  getSprints(projectId?: string): Observable<Sprint[]> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }

    return this.http.get<Sprint[]>(this.API_URL, { params }).pipe(
      tap(sprints => {
        this.sprints.set(sprints);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load sprints');
        this.loading.set(false);
        console.error('Error loading sprints:', error);
        return of([]);
      })
    );
  }

  /**
   * Get a single sprint by ID
   */
  getSprint(id: string): Observable<Sprint> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Sprint>(`${this.API_URL}/${id}`).pipe(
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.error.set('Failed to load sprint');
        this.loading.set(false);
        console.error('Error loading sprint:', error);
        throw error;
      })
    );
  }

  /**
   * Get the active sprint
   */
  getActiveSprint(projectId?: string): Observable<Sprint | null> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams().set('status', 'active');
    if (projectId) {
      params = params.set('projectId', projectId);
    }

    return this.http.get<Sprint[]>(this.API_URL, { params }).pipe(
      tap(sprints => {
        const active = sprints.length > 0 ? sprints[0] : null;
        this.activeSprint.set(active);
        this.loading.set(false);
      }),
      map(sprints => sprints.length > 0 ? sprints[0] : null),
      catchError(error => {
        this.error.set('Failed to load active sprint');
        this.loading.set(false);
        console.error('Error loading active sprint:', error);
        return of(null);
      })
    );
  }

  /**
   * Create a new sprint
   */
  createSprint(sprint: Partial<Sprint>): Observable<Sprint> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<Sprint>(this.API_URL, sprint).pipe(
      tap(newSprint => {
        this.sprints.update(sprints => [...sprints, newSprint]);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to create sprint');
        this.loading.set(false);
        console.error('Error creating sprint:', error);
        throw error;
      })
    );
  }

  /**
   * Update an existing sprint
   */
  updateSprint(id: string, updates: Partial<Sprint>): Observable<Sprint> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.patch<Sprint>(`${this.API_URL}/${id}`, updates).pipe(
      tap(updatedSprint => {
        this.sprints.update(sprints =>
          sprints.map(sprint => sprint.id === id ? updatedSprint : sprint)
        );
        if (this.activeSprint()?.id === id) {
          this.activeSprint.set(updatedSprint);
        }
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to update sprint');
        this.loading.set(false);
        console.error('Error updating sprint:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a sprint
   */
  deleteSprint(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.sprints.update(sprints => sprints.filter(sprint => sprint.id !== id));
        if (this.activeSprint()?.id === id) {
          this.activeSprint.set(null);
        }
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to delete sprint');
        this.loading.set(false);
        console.error('Error deleting sprint:', error);
        throw error;
      })
    );
  }

  /**
   * Start a sprint
   */
  startSprint(id: string): Observable<Sprint> {
    return this.http.post<Sprint>(`${this.API_URL}/${id}/start`, {}).pipe(
      tap(startedSprint => {
        this.sprints.update(sprints =>
          sprints.map(sprint => sprint.id === id ? startedSprint : sprint)
        );
        this.activeSprint.set(startedSprint);
      }),
      catchError(error => {
        console.error('Error starting sprint:', error);
        throw error;
      })
    );
  }

  /**
   * Complete a sprint
   */
  completeSprint(id: string): Observable<Sprint> {
    return this.http.post<Sprint>(`${this.API_URL}/${id}/complete`, {}).pipe(
      tap(completedSprint => {
        this.sprints.update(sprints =>
          sprints.map(sprint => sprint.id === id ? completedSprint : sprint)
        );
        if (this.activeSprint()?.id === id) {
          this.activeSprint.set(null);
        }
      }),
      catchError(error => {
        console.error('Error completing sprint:', error);
        throw error;
      })
    );
  }

  /**
   * Get sprint statistics
   */
  getSprintStats(id: string): Observable<SprintStats> {
    return this.http.get<SprintStats>(`${this.API_URL}/${id}/stats`).pipe(
      catchError(error => {
        console.error('Error getting sprint stats:', error);
        return of({
          totalIssues: 0,
          completedIssues: 0,
          inProgressIssues: 0,
          todoIssues: 0,
          totalStoryPoints: 0,
          completedStoryPoints: 0,
          remainingStoryPoints: 0
        });
      })
    );
  }

  /**
   * Get velocity data for multiple sprints
   */
  getVelocityData(projectId?: string, count = 6): Observable<SprintVelocity[]> {
    let params = new HttpParams()
      .set('count', count.toString())
      .set('status', 'completed');

    if (projectId) {
      params = params.set('projectId', projectId);
    }

    return this.http.get<SprintVelocity[]>(`${this.API_URL}/velocity`, { params }).pipe(
      catchError(error => {
        console.error('Error getting velocity data:', error);
        return of([]);
      })
    );
  }

  /**
   * Get burndown data for a sprint
   */
  getBurndownData(sprintId: string): Observable<BurndownData[]> {
    return this.http.get<BurndownData[]>(`${this.API_URL}/${sprintId}/burndown`).pipe(
      catchError(error => {
        console.error('Error getting burndown data:', error);
        return of([]);
      })
    );
  }

  /**
   * Add issues to sprint
   */
  addIssuesToSprint(sprintId: string, issueIds: string[]): Observable<Sprint> {
    return this.http.post<Sprint>(`${this.API_URL}/${sprintId}/issues`, { issueIds }).pipe(
      tap(updatedSprint => {
        this.sprints.update(sprints =>
          sprints.map(sprint => sprint.id === sprintId ? updatedSprint : sprint)
        );
      }),
      catchError(error => {
        console.error('Error adding issues to sprint:', error);
        throw error;
      })
    );
  }

  /**
   * Remove issues from sprint
   */
  removeIssuesFromSprint(sprintId: string, issueIds: string[]): Observable<Sprint> {
    const params = new HttpParams().set('issueIds', issueIds.join(','));

    return this.http.delete<Sprint>(`${this.API_URL}/${sprintId}/issues`, { params }).pipe(
      tap(updatedSprint => {
        this.sprints.update(sprints =>
          sprints.map(sprint => sprint.id === sprintId ? updatedSprint : sprint)
        );
      }),
      catchError(error => {
        console.error('Error removing issues from sprint:', error);
        throw error;
      })
    );
  }
}
