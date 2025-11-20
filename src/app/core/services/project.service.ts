import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Project {
  id: string;
  key: string; // e.g., "PROJ"
  name: string;
  description?: string;
  avatar?: string;
  projectType?: string;
  projectCategory?: string;
  lead?: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  issueCount?: number;
  memberCount?: number;
}

export interface CreateProjectDto {
  key: string;
  name: string;
  description?: string;
  leadId?: string;
  projectType?: string;
}

export interface UpdateProjectDto {
  key?: string;
  name?: string;
  description?: string;
  leadId?: string;
  projectType?: string;
}

export interface PaginatedProjects {
  items: Project[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = `${environment.apiUrl}/projects`;
  private readonly CURRENT_PROJECT_KEY = 'jira_current_project';

  // Signals for reactive state
  projects = signal<Project[]>([]);
  currentProject = signal<Project | null>(this.getCurrentProjectFromStorage());
  loading = signal(false);
  error = signal<string | null>(null);

  // Cache for quick access
  private projectsCache = new Map<string, Project>();
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  projects$ = this.projectsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all projects with optional pagination
   */
  getProjects(page = 1, pageSize = 50): Observable<PaginatedProjects> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedProjects>(this.API_URL, { params }).pipe(
      tap(response => {
        response.items.forEach(project => this.projectsCache.set(project.id, project));
        this.projects.set(response.items);
        this.projectsSubject.next(response.items);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load projects');
        this.loading.set(false);
        console.error('Error loading projects:', error);
        throw error;
      })
    );
  }

  /**
   * Get all projects (simple list)
   */
  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.API_URL).pipe(
      tap(projects => {
        projects.forEach(project => this.projectsCache.set(project.id, project));
        this.projects.set(projects);
        this.projectsSubject.next(projects);
      })
    );
  }

  /**
   * Get a single project by ID
   */
  getById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/${id}`).pipe(
      tap(project => {
        this.projectsCache.set(project.id, project);
      }),
      catchError(error => {
        console.error('Error loading project:', error);
        throw error;
      })
    );
  }

  /**
   * Get project by key (e.g., "PROJ")
   */
  getByKey(key: string): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/key/${key}`).pipe(
      tap(project => {
        this.projectsCache.set(project.id, project);
      })
    );
  }

  /**
   * Create a new project
   */
  create(dto: CreateProjectDto): Observable<Project> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<Project>(this.API_URL, dto).pipe(
      tap(newProject => {
        this.projectsCache.set(newProject.id, newProject);
        this.projects.update(projects => [...projects, newProject]);
        this.projectsSubject.next(this.projects());
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to create project');
        this.loading.set(false);
        console.error('Error creating project:', error);
        throw error;
      })
    );
  }

  /**
   * Update an existing project
   */
  update(id: string, dto: UpdateProjectDto): Observable<Project> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.patch<Project>(`${this.API_URL}/${id}`, dto).pipe(
      tap(updatedProject => {
        this.projectsCache.set(updatedProject.id, updatedProject);
        this.projects.update(projects =>
          projects.map(project => project.id === id ? updatedProject : project)
        );
        this.projectsSubject.next(this.projects());
        if (this.currentProject()?.id === id) {
          this.setCurrentProject(updatedProject);
        }
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to update project');
        this.loading.set(false);
        console.error('Error updating project:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a project
   */
  delete(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.projectsCache.delete(id);
        this.projects.update(projects => projects.filter(project => project.id !== id));
        this.projectsSubject.next(this.projects());
        if (this.currentProject()?.id === id) {
          this.currentProject.set(null);
          localStorage.removeItem(this.CURRENT_PROJECT_KEY);
        }
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to delete project');
        this.loading.set(false);
        console.error('Error deleting project:', error);
        throw error;
      })
    );
  }

  /**
   * Set current project and save to localStorage
   */
  setCurrentProject(project: Project): void {
    localStorage.setItem(this.CURRENT_PROJECT_KEY, JSON.stringify(project));
    this.currentProject.set(project);
  }

  /**
   * Get cached project
   */
  getCachedProject(id: string): Project | undefined {
    return this.projectsCache.get(id);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.projectsCache.clear();
  }

  /**
   * Get current project from localStorage
   */
  private getCurrentProjectFromStorage(): Project | null {
    const projectJson = localStorage.getItem(this.CURRENT_PROJECT_KEY);
    return projectJson ? JSON.parse(projectJson) : null;
  }
}
