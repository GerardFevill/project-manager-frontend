import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Sprint, CreateSprintDto, UpdateSprintDto, SprintStatus, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SprintLocalService {
  private readonly STORAGE_KEY = 'project-manager-sprints';
  private sprints: Sprint[] = [];
  private nextId = 1;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.sprints = data.sprints || [];
        this.nextId = data.nextId || 1;
      } catch (e) {
        console.error('Error loading sprints from storage:', e);
        this.sprints = [];
        this.nextId = 1;
      }
    }
  }

  private saveToStorage(): void {
    const data = {
      sprints: this.sprints,
      nextId: this.nextId
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Get all sprints with optional filters
   */
  findAll(filters?: {
    status?: SprintStatus;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Sprint>> {
    let filteredSprints = [...this.sprints];

    if (filters?.status) {
      filteredSprints = filteredSprints.filter(s => s.status === filters.status);
    }

    // Sort by createdAt desc
    filteredSprints.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const limit = filters?.limit || 50;
    const page = filters?.page || 1;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = filteredSprints.slice(start, end);

    const totalPages = Math.ceil(filteredSprints.length / limit);
    const response: PaginatedResponse<Sprint> = {
      data: paginatedData,
      meta: {
        total: filteredSprints.length,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    };

    return of(response).pipe(delay(100));
  }

  /**
   * Get active sprint
   */
  getActiveSprint(): Observable<Sprint | null> {
    const active = this.sprints.find(s => s.status === SprintStatus.ACTIVE);
    return of(active || null).pipe(delay(50));
  }

  /**
   * Get sprint by ID
   */
  findOne(id: number): Observable<Sprint> {
    const sprint = this.sprints.find(s => s.id === id);
    if (!sprint) {
      return throwError(() => new Error('Sprint not found'));
    }
    return of(sprint).pipe(delay(50));
  }

  /**
   * Create a new sprint
   */
  create(createSprintDto: CreateSprintDto): Observable<Sprint> {
    const now = new Date().toISOString();
    const newSprint: Sprint = {
      id: this.nextId++,
      name: createSprintDto.name,
      goal: createSprintDto.goal,
      startDate: createSprintDto.startDate,
      endDate: createSprintDto.endDate,
      status: SprintStatus.PLANNED,
      createdAt: now,
      updatedAt: now
    };

    this.sprints.push(newSprint);
    this.saveToStorage();

    return of(newSprint).pipe(delay(100));
  }

  /**
   * Update an existing sprint
   */
  update(id: number, updateSprintDto: UpdateSprintDto): Observable<Sprint> {
    const index = this.sprints.findIndex(s => s.id === id);
    if (index === -1) {
      return throwError(() => new Error('Sprint not found'));
    }

    const sprint = this.sprints[index];
    this.sprints[index] = {
      ...sprint,
      ...updateSprintDto,
      updatedAt: new Date().toISOString()
    };

    this.saveToStorage();
    return of(this.sprints[index]).pipe(delay(100));
  }

  /**
   * Delete a sprint
   */
  delete(id: number): Observable<void> {
    const index = this.sprints.findIndex(s => s.id === id);
    if (index === -1) {
      return throwError(() => new Error('Sprint not found'));
    }

    this.sprints.splice(index, 1);
    this.saveToStorage();

    return of(void 0).pipe(delay(100));
  }

  /**
   * Start a sprint (change status to active)
   */
  startSprint(id: number): Observable<Sprint> {
    // Only one sprint can be active at a time
    const activeIndex = this.sprints.findIndex(s => s.status === SprintStatus.ACTIVE);
    if (activeIndex !== -1) {
      return throwError(() => new Error('Un sprint est déjà actif'));
    }

    return this.update(id, { status: SprintStatus.ACTIVE });
  }

  /**
   * Complete a sprint (change status to completed)
   */
  completeSprint(id: number): Observable<Sprint> {
    return this.update(id, { status: SprintStatus.COMPLETED });
  }

  /**
   * These methods are not needed as tasks are managed separately
   */
  assignTaskToSprint(sprintId: number, taskId: number | string): Observable<void> {
    return of(void 0).pipe(delay(50));
  }

  removeTaskFromSprint(sprintId: number, taskId: number | string): Observable<void> {
    return of(void 0).pipe(delay(50));
  }

  getSprintTasks(sprintId: number): Observable<any[]> {
    return of([]).pipe(delay(50));
  }
}
