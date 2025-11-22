import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from './issue.service';

export interface Activity {
  id: string;
  type: ActivityType;
  action: string;
  description: string;
  user: User;
  targetId: string;
  targetType: 'issue' | 'sprint' | 'comment' | 'attachment';
  targetKey?: string;
  targetTitle?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type ActivityType =
  | 'issue_created'
  | 'issue_updated'
  | 'issue_status_changed'
  | 'issue_assigned'
  | 'issue_commented'
  | 'sprint_started'
  | 'sprint_completed'
  | 'attachment_added'
  | 'work_logged';

export interface ActivityFilters {
  userId?: string;
  targetId?: string;
  targetType?: string;
  type?: ActivityType[];
  startDate?: Date;
  endDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private readonly API_URL = `${environment.apiUrl}/activity`;

  // Signals for reactive state
  activities = signal<Activity[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Get recent activities
   */
  getActivities(
    filters?: ActivityFilters,
    limit = 20
  ): Observable<Activity[]> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams().set('limit', limit.toString());

    if (filters) {
      if (filters.userId) {
        params = params.set('userId', filters.userId);
      }
      if (filters.targetId) {
        params = params.set('targetId', filters.targetId);
      }
      if (filters.targetType) {
        params = params.set('targetType', filters.targetType);
      }
      if (filters.type?.length) {
        params = params.set('type', filters.type.join(','));
      }
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate.toISOString());
      }
    }

    return this.http.get<Activity[]>(this.API_URL, { params }).pipe(
      tap(activities => {
        this.activities.set(activities);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load activities');
        this.loading.set(false);
        console.error('Error loading activities:', error);
        return of([]);
      })
    );
  }

  /**
   * Get activities for a specific issue
   */
  getIssueActivities(issueId: string): Observable<Activity[]> {
    return this.getActivities({
      targetId: issueId,
      targetType: 'issue'
    });
  }

  /**
   * Get activities for current user
   */
  getMyActivities(limit = 20): Observable<Activity[]> {
    return this.getActivities({
      userId: 'currentUser'
    }, limit);
  }

  /**
   * Get activities for a team
   */
  getTeamActivities(teamId: string, limit = 20): Observable<Activity[]> {
    let params = new HttpParams()
      .set('teamId', teamId)
      .set('limit', limit.toString());

    return this.http.get<Activity[]>(this.API_URL, { params }).pipe(
      catchError(error => {
        console.error('Error loading team activities:', error);
        return of([]);
      })
    );
  }

  /**
   * Log a new activity (usually done automatically by the backend)
   */
  logActivity(activity: Partial<Activity>): Observable<Activity> {
    return this.http.post<Activity>(this.API_URL, activity).pipe(
      tap(newActivity => {
        this.activities.update(activities => [newActivity, ...activities]);
      }),
      catchError(error => {
        console.error('Error logging activity:', error);
        throw error;
      })
    );
  }

  /**
   * Get activity summary
   */
  getActivitySummary(
    period: 'day' | 'week' | 'month'
  ): Observable<{
    totalActivities: number;
    issuesCreated: number;
    issuesCompleted: number;
    commentsAdded: number;
    sprintsCompleted: number;
  }> {
    const params = new HttpParams().set('period', period);

    return this.http.get<any>(`${this.API_URL}/summary`, { params }).pipe(
      catchError(error => {
        console.error('Error loading activity summary:', error);
        return of({
          totalActivities: 0,
          issuesCreated: 0,
          issuesCompleted: 0,
          commentsAdded: 0,
          sprintsCompleted: 0
        });
      })
    );
  }

  /**
   * Format activity description for display
   */
  formatActivityDescription(activity: Activity): string {
    switch (activity.type) {
      case 'issue_created':
        return `created issue ${activity.targetKey || activity.targetId}`;
      case 'issue_updated':
        return `updated issue ${activity.targetKey || activity.targetId}`;
      case 'issue_status_changed':
        return `moved ${activity.targetKey} to ${activity.metadata?.['newStatus']}`;
      case 'issue_assigned':
        return `assigned ${activity.targetKey} to ${activity.metadata?.['assignee']}`;
      case 'issue_commented':
        return `commented on ${activity.targetKey}`;
      case 'sprint_started':
        return `started sprint "${activity.targetTitle}"`;
      case 'sprint_completed':
        return `completed sprint "${activity.targetTitle}"`;
      case 'attachment_added':
        return `added attachment to ${activity.targetKey}`;
      case 'work_logged':
        return `logged ${activity.metadata?.['timeSpent']} on ${activity.targetKey}`;
      default:
        return activity.description || activity.action;
    }
  }

  /**
   * Get activity icon name
   */
  getActivityIcon(activity: Activity): string {
    switch (activity.type) {
      case 'issue_created':
        return 'plus';
      case 'issue_updated':
        return 'edit';
      case 'issue_status_changed':
        return 'arrow-right';
      case 'issue_assigned':
        return 'user';
      case 'issue_commented':
        return 'comment';
      case 'sprint_started':
      case 'sprint_completed':
        return 'sprint';
      case 'attachment_added':
        return 'attachment';
      case 'work_logged':
        return 'clock';
      default:
        return 'info';
    }
  }

  /**
   * Clear activities cache
   */
  clearCache(): void {
    this.activities.set([]);
  }
}
