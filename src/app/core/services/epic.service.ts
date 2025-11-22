import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Epic,
  CreateEpicDto,
  UpdateEpicDto,
  PaginatedEpics,
  EpicProgress,
  EpicStatus,
} from '../models/epic.model';
import { Issue } from './issue.service';

@Injectable({
  providedIn: 'root',
})
export class EpicService {
  private readonly API_URL = `${environment.apiUrl}/epics`;

  // Signal-based state management
  epics = signal<Epic[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  currentEpic = signal<Epic | null>(null);

  // Computed signals
  activeEpics = computed(() =>
    this.epics().filter((epic) => epic.status !== 'done' && epic.status !== 'cancelled')
  );

  completedEpics = computed(() =>
    this.epics().filter((epic) => epic.status === 'done')
  );

  // BehaviorSubject for traditional Observable pattern (backward compatibility)
  private epicsSubject = new BehaviorSubject<Epic[]>([]);
  epics$ = this.epicsSubject.asObservable();

  // Cache
  private epicsCache = new Map<string, Epic>();
  private cacheTimestamp: number | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) {}

  /**
   * Get all epics with optional filters and pagination
   */
  getEpics(
    page: number = 1,
    pageSize: number = 50,
    filters?: {
      projectId?: string;
      status?: EpicStatus;
      search?: string;
    }
  ): Observable<PaginatedEpics> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters?.projectId) {
      params = params.set('projectId', filters.projectId);
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    return this.http.get<PaginatedEpics>(this.API_URL, { params }).pipe(
      tap((response) => {
        const epics = response?.items || [];
        epics.forEach((epic) => this.epicsCache.set(epic.id, epic));
        this.epics.set(epics);
        this.epicsSubject.next(epics);
        this.loading.set(false);
        this.cacheTimestamp = Date.now();
      }),
      catchError((error) => {
        this.error.set('Failed to load epics');
        this.loading.set(false);
        console.error('Error loading epics:', error);
        return of({ items: [], total: 0, page: 1, pageSize: pageSize });
      })
    );
  }

  /**
   * Get a single epic by ID
   */
  getEpic(id: string, forceRefresh: boolean = false): Observable<Epic> {
    // Check cache first
    if (!forceRefresh && this.epicsCache.has(id)) {
      const cached = this.epicsCache.get(id)!;
      this.currentEpic.set(cached);
      return of(cached);
    }

    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Epic>(`${this.API_URL}/${id}`).pipe(
      tap((epic) => {
        this.epicsCache.set(epic.id, epic);
        this.currentEpic.set(epic);
        this.loading.set(false);
      }),
      catchError((error) => {
        this.error.set(`Failed to load epic: ${id}`);
        this.loading.set(false);
        console.error('Error loading epic:', error);
        throw error;
      })
    );
  }

  /**
   * Get epic by key (e.g., "PROJ-123")
   */
  getEpicByKey(key: string): Observable<Epic> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Epic>(`${this.API_URL}/key/${key}`).pipe(
      tap((epic) => {
        this.epicsCache.set(epic.id, epic);
        this.currentEpic.set(epic);
        this.loading.set(false);
      }),
      catchError((error) => {
        this.error.set(`Failed to load epic: ${key}`);
        this.loading.set(false);
        console.error('Error loading epic by key:', error);
        throw error;
      })
    );
  }

  /**
   * Create a new epic
   */
  createEpic(dto: CreateEpicDto): Observable<Epic> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<Epic>(this.API_URL, dto).pipe(
      tap((epic) => {
        this.epicsCache.set(epic.id, epic);
        this.epics.update((epics) => [epic, ...epics]);
        this.epicsSubject.next(this.epics());
        this.loading.set(false);
        this.invalidateCache();
      }),
      catchError((error) => {
        this.error.set('Failed to create epic');
        this.loading.set(false);
        console.error('Error creating epic:', error);
        throw error;
      })
    );
  }

  /**
   * Update an existing epic
   */
  updateEpic(id: string, dto: UpdateEpicDto): Observable<Epic> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.patch<Epic>(`${this.API_URL}/${id}`, dto).pipe(
      tap((updatedEpic) => {
        this.epicsCache.set(updatedEpic.id, updatedEpic);
        this.epics.update((epics) =>
          epics.map((epic) => (epic.id === id ? updatedEpic : epic))
        );
        this.epicsSubject.next(this.epics());
        if (this.currentEpic()?.id === id) {
          this.currentEpic.set(updatedEpic);
        }
        this.loading.set(false);
        this.invalidateCache();
      }),
      catchError((error) => {
        this.error.set('Failed to update epic');
        this.loading.set(false);
        console.error('Error updating epic:', error);
        throw error;
      })
    );
  }

  /**
   * Delete an epic
   */
  deleteEpic(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.epicsCache.delete(id);
        this.epics.update((epics) => epics.filter((epic) => epic.id !== id));
        this.epicsSubject.next(this.epics());
        if (this.currentEpic()?.id === id) {
          this.currentEpic.set(null);
        }
        this.loading.set(false);
        this.invalidateCache();
      }),
      catchError((error) => {
        this.error.set('Failed to delete epic');
        this.loading.set(false);
        console.error('Error deleting epic:', error);
        throw error;
      })
    );
  }

  /**
   * Get epic progress with child issue statistics
   */
  getEpicProgress(id: string): Observable<EpicProgress> {
    return this.http.get<EpicProgress>(`${this.API_URL}/${id}/progress`).pipe(
      catchError((error) => {
        console.error('Error loading epic progress:', error);
        // Fallback to calculating from epic data
        const epic = this.epicsCache.get(id);
        if (epic) {
          return of(this.calculateProgressFromEpic(epic));
        }
        throw error;
      })
    );
  }

  /**
   * Get issues belonging to an epic
   */
  getEpicIssues(epicId: string): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.API_URL}/${epicId}/issues`).pipe(
      catchError((error) => {
        console.error('Error loading epic issues:', error);
        return of([]);
      })
    );
  }

  /**
   * Add issues to an epic
   */
  addIssuesToEpic(epicId: string, issueIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${epicId}/issues`, { issueIds }).pipe(
      tap(() => {
        this.invalidateCache();
        // Optionally refresh the epic
        this.getEpic(epicId, true).subscribe();
      }),
      catchError((error) => {
        console.error('Error adding issues to epic:', error);
        throw error;
      })
    );
  }

  /**
   * Remove issues from an epic
   */
  removeIssuesFromEpic(epicId: string, issueIds: string[]): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${epicId}/issues`, {
      body: { issueIds },
    }).pipe(
      tap(() => {
        this.invalidateCache();
        // Optionally refresh the epic
        this.getEpic(epicId, true).subscribe();
      }),
      catchError((error) => {
        console.error('Error removing issues from epic:', error);
        throw error;
      })
    );
  }

  /**
   * Search epics by query
   */
  searchEpics(query: string): Observable<Epic[]> {
    if (!query || query.trim().length === 0) {
      return of(this.epics());
    }

    const params = new HttpParams().set('search', query.trim());

    return this.http.get<PaginatedEpics>(this.API_URL, { params }).pipe(
      map((response) => response.items || []),
      catchError((error) => {
        console.error('Error searching epics:', error);
        // Fallback to local filtering
        const lowerQuery = query.toLowerCase();
        return of(
          this.epics().filter(
            (epic) =>
              epic.name.toLowerCase().includes(lowerQuery) ||
              epic.key.toLowerCase().includes(lowerQuery) ||
              epic.description?.toLowerCase().includes(lowerQuery)
          )
        );
      })
    );
  }

  /**
   * Get epics by project
   */
  getEpicsByProject(projectId: string): Observable<Epic[]> {
    return this.getEpics(1, 100, { projectId }).pipe(
      map((response) => response.items || [])
    );
  }

  /**
   * Calculate progress from epic data (fallback when API doesn't provide it)
   */
  private calculateProgressFromEpic(epic: Epic): EpicProgress {
    const total = epic.totalIssues || 0;
    const completed = epic.completedIssues || 0;
    const inProgress = epic.inProgressIssues || 0;
    const todo = epic.todoIssues || total - completed - inProgress;

    return {
      id: epic.id,
      key: epic.key,
      summary: epic.name,
      total,
      completed,
      inProgress,
      todo,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      storyPoints: {
        total: epic.totalPoints || 0,
        completed: epic.completedPoints || 0,
        remaining: (epic.totalPoints || 0) - (epic.completedPoints || 0),
      },
    };
  }

  /**
   * Invalidate cache
   */
  private invalidateCache(): void {
    this.cacheTimestamp = null;
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    if (!this.cacheTimestamp) {
      return false;
    }
    return Date.now() - this.cacheTimestamp < this.CACHE_DURATION;
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.epicsCache.clear();
    this.cacheTimestamp = null;
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.epics.set([]);
    this.loading.set(false);
    this.error.set(null);
    this.currentEpic.set(null);
    this.clearCache();
  }
}
