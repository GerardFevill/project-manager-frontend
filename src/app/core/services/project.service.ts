import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  avatar?: string;
  projectType: string;
  projectCategory?: string;
  lead?: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = `${environment.apiUrl}/projects`;
  private readonly CURRENT_PROJECT_KEY = 'jira_current_project';

  currentProject = signal<Project | null>(this.getCurrentProjectFromStorage());

  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.API_URL);
  }

  getById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/${id}`);
  }

  create(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.API_URL, project);
  }

  update(id: string, project: Partial<Project>): Observable<Project> {
    return this.http.patch<Project>(`${this.API_URL}/${id}`, project);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  setCurrentProject(project: Project): void {
    localStorage.setItem(this.CURRENT_PROJECT_KEY, JSON.stringify(project));
    this.currentProject.set(project);
  }

  private getCurrentProjectFromStorage(): Project | null {
    const projectJson = localStorage.getItem(this.CURRENT_PROJECT_KEY);
    return projectJson ? JSON.parse(projectJson) : null;
  }
}
