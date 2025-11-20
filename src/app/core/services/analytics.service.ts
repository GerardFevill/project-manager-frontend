import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IssueStatus, IssuePriority, IssueType } from './issue.service';

export interface OverviewStats {
  openIssues: number;
  inProgressIssues: number;
  completedIssues: number;
  blockedIssues: number;
  openIssuesChange: number;
  inProgressChange: number;
  completedChange: number;
  blockedChange: number;
}

export interface IssueDistribution {
  label: string;
  value: number;
  percentage: number;
}

export interface CreatedVsResolvedData {
  date: Date;
  created: number;
  resolved: number;
}

export interface CumulativeFlowData {
  date: Date;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
}

export interface ResolutionTimeData {
  issueType: IssueType;
  averageTime: number; // in hours
  median: number;
  min: number;
  max: number;
}

export interface TeamWorkloadData {
  userId: string;
  userName: string;
  openIssues: number;
  inProgressIssues: number;
  totalStoryPoints: number;
}

export interface TimeRangeFilter {
  startDate?: Date;
  endDate?: Date;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly API_URL = `${environment.apiUrl}/analytics`;

  // Signals for reactive state
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Get overview statistics
   */
  getOverviewStats(projectId?: string): Observable<OverviewStats> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }

    return this.http.get<OverviewStats>(`${this.API_URL}/overview`, { params }).pipe(
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.error.set('Failed to load overview stats');
        this.loading.set(false);
        console.error('Error loading overview stats:', error);
        return of({
          openIssues: 0,
          inProgressIssues: 0,
          completedIssues: 0,
          blockedIssues: 0,
          openIssuesChange: 0,
          inProgressChange: 0,
          completedChange: 0,
          blockedChange: 0
        });
      })
    );
  }

  /**
   * Get issue distribution by status, priority, or type
   */
  getIssueDistribution(
    groupBy: 'status' | 'priority' | 'type',
    projectId?: string
  ): Observable<IssueDistribution[]> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams().set('groupBy', groupBy);
    if (projectId) {
      params = params.set('projectId', projectId);
    }

    return this.http.get<IssueDistribution[]>(`${this.API_URL}/distribution`, { params }).pipe(
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.error.set('Failed to load issue distribution');
        this.loading.set(false);
        console.error('Error loading issue distribution:', error);
        return of([]);
      })
    );
  }

  /**
   * Get created vs resolved issues over time
   */
  getCreatedVsResolved(
    timeRange: TimeRangeFilter,
    projectId?: string
  ): Observable<CreatedVsResolvedData[]> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }
    if (timeRange.period) {
      params = params.set('period', timeRange.period);
    }
    if (timeRange.startDate) {
      params = params.set('startDate', timeRange.startDate.toISOString());
    }
    if (timeRange.endDate) {
      params = params.set('endDate', timeRange.endDate.toISOString());
    }

    return this.http.get<CreatedVsResolvedData[]>(`${this.API_URL}/created-vs-resolved`, { params }).pipe(
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.error.set('Failed to load created vs resolved data');
        this.loading.set(false);
        console.error('Error loading created vs resolved data:', error);
        return of([]);
      })
    );
  }

  /**
   * Get cumulative flow diagram data
   */
  getCumulativeFlowData(
    timeRange: TimeRangeFilter,
    projectId?: string
  ): Observable<CumulativeFlowData[]> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }
    if (timeRange.period) {
      params = params.set('period', timeRange.period);
    }
    if (timeRange.startDate) {
      params = params.set('startDate', timeRange.startDate.toISOString());
    }
    if (timeRange.endDate) {
      params = params.set('endDate', timeRange.endDate.toISOString());
    }

    return this.http.get<CumulativeFlowData[]>(`${this.API_URL}/cumulative-flow`, { params }).pipe(
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.error.set('Failed to load cumulative flow data');
        this.loading.set(false);
        console.error('Error loading cumulative flow data:', error);
        return of([]);
      })
    );
  }

  /**
   * Get average resolution time by issue type
   */
  getResolutionTime(projectId?: string): Observable<ResolutionTimeData[]> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }

    return this.http.get<ResolutionTimeData[]>(`${this.API_URL}/resolution-time`, { params }).pipe(
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.error.set('Failed to load resolution time data');
        this.loading.set(false);
        console.error('Error loading resolution time data:', error);
        return of([]);
      })
    );
  }

  /**
   * Get team workload distribution
   */
  getTeamWorkload(projectId?: string): Observable<TeamWorkloadData[]> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }

    return this.http.get<TeamWorkloadData[]>(`${this.API_URL}/team-workload`, { params }).pipe(
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.error.set('Failed to load team workload data');
        this.loading.set(false);
        console.error('Error loading team workload data:', error);
        return of([]);
      })
    );
  }

  /**
   * Get epic progress
   */
  getEpicProgress(epicId: string): Observable<{
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    percentage: number;
  }> {
    return this.http.get<any>(`${this.API_URL}/epic/${epicId}/progress`).pipe(
      catchError(error => {
        console.error('Error loading epic progress:', error);
        return of({
          total: 0,
          completed: 0,
          inProgress: 0,
          todo: 0,
          percentage: 0
        });
      })
    );
  }

  /**
   * Get all epics with progress
   */
  getEpicsWithProgress(projectId?: string): Observable<{
    id: string;
    key: string;
    summary: string;
    progress: number;
    total: number;
    completed: number;
  }[]> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }

    return this.http.get<any[]>(`${this.API_URL}/epics/progress`, { params }).pipe(
      catchError(error => {
        console.error('Error loading epics progress:', error);
        return of([]);
      })
    );
  }

  /**
   * Get custom report data
   */
  getCustomReport(reportConfig: any): Observable<any> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<any>(`${this.API_URL}/custom-report`, reportConfig).pipe(
      tap(() => this.loading.set(false)),
      catchError(error => {
        this.error.set('Failed to generate custom report');
        this.loading.set(false);
        console.error('Error generating custom report:', error);
        throw error;
      })
    );
  }
}
