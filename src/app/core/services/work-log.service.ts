import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  WorkLog,
  CreateWorkLogDto,
  UpdateWorkLogDto,
  WorkLogListResponse,
  TimeTracking
} from '../models/work-log.model';

@Injectable({
  providedIn: 'root'
})
export class WorkLogService {
  private apiUrl = `${environment.apiUrl}/issues`;
  private workLogsCache = new Map<string, BehaviorSubject<WorkLog[]>>();

  constructor(private http: HttpClient) {}

  /**
   * Get all work logs for an issue
   */
  getWorkLogs(issueId: string): Observable<WorkLogListResponse> {
    return this.http.get<WorkLogListResponse>(
      `${this.apiUrl}/${issueId}/worklogs`
    ).pipe(
      tap(response => {
        // Update cache
        if (!this.workLogsCache.has(issueId)) {
          this.workLogsCache.set(issueId, new BehaviorSubject<WorkLog[]>([]));
        }
        this.workLogsCache.get(issueId)!.next(response.items);
      })
    );
  }

  /**
   * Get a single work log
   */
  getWorkLog(issueId: string, workLogId: string): Observable<WorkLog> {
    return this.http.get<WorkLog>(
      `${this.apiUrl}/${issueId}/worklogs/${workLogId}`
    );
  }

  /**
   * Create a new work log
   */
  createWorkLog(issueId: string, dto: CreateWorkLogDto): Observable<WorkLog> {
    return this.http.post<WorkLog>(
      `${this.apiUrl}/${issueId}/worklogs`,
      dto
    ).pipe(
      tap(workLog => {
        // Add to cache
        if (this.workLogsCache.has(issueId)) {
          const current = this.workLogsCache.get(issueId)!.value;
          this.workLogsCache.get(issueId)!.next([...current, workLog]);
        }
      })
    );
  }

  /**
   * Update an existing work log
   */
  updateWorkLog(
    issueId: string,
    workLogId: string,
    dto: UpdateWorkLogDto
  ): Observable<WorkLog> {
    return this.http.patch<WorkLog>(
      `${this.apiUrl}/${issueId}/worklogs/${workLogId}`,
      dto
    ).pipe(
      tap(updatedWorkLog => {
        // Update cache
        if (this.workLogsCache.has(issueId)) {
          const current = this.workLogsCache.get(issueId)!.value;
          const updated = current.map(w =>
            w.id === workLogId ? updatedWorkLog : w
          );
          this.workLogsCache.get(issueId)!.next(updated);
        }
      })
    );
  }

  /**
   * Delete a work log
   */
  deleteWorkLog(issueId: string, workLogId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${issueId}/worklogs/${workLogId}`
    ).pipe(
      tap(() => {
        // Remove from cache
        if (this.workLogsCache.has(issueId)) {
          const current = this.workLogsCache.get(issueId)!.value;
          const filtered = current.filter(w => w.id !== workLogId);
          this.workLogsCache.get(issueId)!.next(filtered);
        }
      })
    );
  }

  /**
   * Get time tracking information for an issue
   */
  getTimeTracking(issueId: string): Observable<TimeTracking> {
    return this.http.get<TimeTracking>(
      `${this.apiUrl}/${issueId}/time-tracking`
    );
  }

  /**
   * Get cached work logs for an issue (as observable)
   */
  getCachedWorkLogs(issueId: string): Observable<WorkLog[]> {
    if (!this.workLogsCache.has(issueId)) {
      this.workLogsCache.set(issueId, new BehaviorSubject<WorkLog[]>([]));
    }
    return this.workLogsCache.get(issueId)!.asObservable();
  }

  /**
   * Format duration from minutes to human-readable string
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Parse duration string to minutes
   * Supports formats: "2h 30m", "2h", "30m", "150m", "2.5h"
   */
  parseDuration(input: string): number | null {
    const trimmed = input.trim().toLowerCase();

    // Parse "2h 30m" or "2h30m"
    const hoursMinutesMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*h(?:\s*(\d+)\s*m)?/);
    if (hoursMinutesMatch) {
      const hours = parseFloat(hoursMinutesMatch[1]);
      const minutes = hoursMinutesMatch[2] ? parseInt(hoursMinutesMatch[2], 10) : 0;
      return Math.round(hours * 60 + minutes);
    }

    // Parse "30m"
    const minutesMatch = trimmed.match(/(\d+)\s*m/);
    if (minutesMatch) {
      return parseInt(minutesMatch[1], 10);
    }

    // Parse plain number (assume minutes)
    const numberMatch = trimmed.match(/^(\d+)$/);
    if (numberMatch) {
      return parseInt(numberMatch[1], 10);
    }

    return null;
  }

  /**
   * Calculate remaining time
   */
  calculateRemainingTime(estimate?: number, spent: number = 0): number | null {
    if (!estimate) return null;
    return Math.max(0, estimate - spent);
  }

  /**
   * Calculate progress percentage
   */
  calculateProgress(estimate?: number, spent: number = 0): number {
    if (!estimate || estimate === 0) return 0;
    return Math.min(100, Math.round((spent / estimate) * 100));
  }

  /**
   * Group work logs by date
   */
  groupWorkLogsByDate(workLogs: WorkLog[]): Map<string, WorkLog[]> {
    const grouped = new Map<string, WorkLog[]>();

    workLogs.forEach(workLog => {
      const date = new Date(workLog.startedAt).toDateString();
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(workLog);
    });

    return grouped;
  }

  /**
   * Sum total time from work logs
   */
  sumTotalTime(workLogs: WorkLog[]): number {
    return workLogs.reduce((sum, log) => sum + log.timeSpent, 0);
  }

  /**
   * Clear cache for an issue
   */
  clearCache(issueId: string): void {
    this.workLogsCache.delete(issueId);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.workLogsCache.clear();
  }
}
