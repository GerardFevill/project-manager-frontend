import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  OverviewReport,
  TimeTrackingReport,
  UserProductivityReport,
  TaskDistributionReport,
  TrendReport,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  /**
   * Get comprehensive overview report
   */
  getOverviewReport(): Observable<OverviewReport> {
    return this.http.get<OverviewReport>(`${this.apiUrl}/overview`);
  }

  /**
   * Get time tracking report
   */
  getTimeTrackingReport(startDate?: string, endDate?: string): Observable<TimeTrackingReport> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<TimeTrackingReport>(`${this.apiUrl}/time-tracking`, { params });
  }

  /**
   * Get user productivity report
   */
  getUserProductivityReport(userId?: string): Observable<UserProductivityReport[]> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);

    return this.http.get<UserProductivityReport[]>(`${this.apiUrl}/user-productivity`, { params });
  }

  /**
   * Get task distribution report
   */
  getTaskDistributionReport(): Observable<TaskDistributionReport> {
    return this.http.get<TaskDistributionReport>(`${this.apiUrl}/task-distribution`);
  }

  /**
   * Get trend report
   */
  getTrendReport(period: 'week' | 'month' | 'quarter' = 'week'): Observable<TrendReport> {
    const params = new HttpParams().set('period', period);
    return this.http.get<TrendReport>(`${this.apiUrl}/trends`, { params });
  }
}
