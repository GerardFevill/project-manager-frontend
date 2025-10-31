import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services';
import {
  OverviewReport,
  TimeTrackingReport,
  UserProductivityReport,
  TaskDistributionReport,
  TrendReport,
  getPriorityDisplayName,
  getPriorityColor,
} from '../../core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent implements OnInit {
  // Loading states
  loadingOverview = signal(false);
  loadingTimeTracking = signal(false);
  loadingProductivity = signal(false);
  loadingDistribution = signal(false);
  loadingTrends = signal(false);

  // Report data
  overviewReport = signal<OverviewReport | null>(null);
  timeTrackingReport = signal<TimeTrackingReport | null>(null);
  productivityReport = signal<UserProductivityReport[]>([]);
  distributionReport = signal<TaskDistributionReport | null>(null);
  trendReport = signal<TrendReport | null>(null);

  // Filters
  trendPeriod = signal<'week' | 'month' | 'quarter'>('week');

  // Table columns
  timeByTaskColumns = ['taskTitle', 'hours', 'estimated', 'percentage'];
  timeByUserColumns = ['userName', 'hours', 'taskCount'];
  productivityColumns = ['userName', 'tasksAssigned', 'tasksCompleted', 'completionRate', 'hoursLogged'];
  distributionByAssigneeColumns = ['userName', 'count'];

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.loadOverviewReport();
    this.loadTimeTrackingReport();
    this.loadProductivityReport();
    this.loadDistributionReport();
    this.loadTrendReport();
  }

  /**
   * Load overview report
   */
  loadOverviewReport() {
    this.loadingOverview.set(true);
    this.reportService.getOverviewReport().subscribe({
      next: (report) => {
        this.overviewReport.set(report);
        this.loadingOverview.set(false);
      },
      error: (error) => {
        console.error('Error loading overview report:', error);
        this.loadingOverview.set(false);
      },
    });
  }

  /**
   * Load time tracking report
   */
  loadTimeTrackingReport() {
    this.loadingTimeTracking.set(true);
    this.reportService.getTimeTrackingReport().subscribe({
      next: (report) => {
        this.timeTrackingReport.set(report);
        this.loadingTimeTracking.set(false);
      },
      error: (error) => {
        console.error('Error loading time tracking report:', error);
        this.loadingTimeTracking.set(false);
      },
    });
  }

  /**
   * Load productivity report
   */
  loadProductivityReport() {
    this.loadingProductivity.set(true);
    this.reportService.getUserProductivityReport().subscribe({
      next: (report) => {
        this.productivityReport.set(report);
        this.loadingProductivity.set(false);
      },
      error: (error) => {
        console.error('Error loading productivity report:', error);
        this.loadingProductivity.set(false);
      },
    });
  }

  /**
   * Load distribution report
   */
  loadDistributionReport() {
    this.loadingDistribution.set(true);
    this.reportService.getTaskDistributionReport().subscribe({
      next: (report) => {
        this.distributionReport.set(report);
        this.loadingDistribution.set(false);
      },
      error: (error) => {
        console.error('Error loading distribution report:', error);
        this.loadingDistribution.set(false);
      },
    });
  }

  /**
   * Load trend report
   */
  loadTrendReport() {
    this.loadingTrends.set(true);
    this.reportService.getTrendReport(this.trendPeriod()).subscribe({
      next: (report) => {
        this.trendReport.set(report);
        this.loadingTrends.set(false);
      },
      error: (error) => {
        console.error('Error loading trend report:', error);
        this.loadingTrends.set(false);
      },
    });
  }

  /**
   * Change trend period
   */
  onTrendPeriodChange(period: 'week' | 'month' | 'quarter') {
    this.trendPeriod.set(period);
    this.loadTrendReport();
  }

  /**
   * Refresh all reports
   */
  refreshAllReports() {
    this.loadOverviewReport();
    this.loadTimeTrackingReport();
    this.loadProductivityReport();
    this.loadDistributionReport();
    this.loadTrendReport();
  }

  /**
   * Helper functions
   */
  getPriorityDisplayName = getPriorityDisplayName;
  getPriorityColor = getPriorityColor;

  /**
   * Get priority entries for display
   */
  getPriorityEntries(): { priority: any; count: number }[] {
    const report = this.overviewReport();
    if (!report) return [];
    return Object.entries(report.tasks.byPriority).map(([priority, count]) => ({
      priority: priority as any,
      count,
    }));
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  /**
   * Format hours
   */
  formatHours(hours: number): string {
    if (hours === 0) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
}
