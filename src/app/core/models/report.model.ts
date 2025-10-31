import { TaskStatus } from './task-enums';

/**
 * Task Priority - matches backend enum
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Overview Report - Comprehensive dashboard metrics
 */
export interface OverviewReport {
  tasks: {
    total: number;
    byPriority: Record<TaskPriority, number>;
    overdue: number;
    completedThisWeek: number;
    completedThisMonth: number;
  };
  workLogs: {
    totalHours: number;
    thisWeek: number;
    thisMonth: number;
    byUser: { userId: string; userName: string; hours: number }[];
  };
  activity: {
    tasksCreated: number;
    tasksCompleted: number;
    commentsAdded: number;
    workLogsAdded: number;
  };
}

/**
 * Time Tracking Report - Work log analysis
 */
export interface TimeTrackingReport {
  totalHours: number;
  byTask: {
    taskId: string;
    taskTitle: string;
    hours: number;
    estimated: number;
    percentage: number;
  }[];
  byUser: {
    userId: string;
    userName: string;
    hours: number;
    taskCount: number;
  }[];
  byDate: {
    date: string;
    hours: number;
    entriesCount: number;
  }[];
}

/**
 * User Productivity Report - Individual user performance
 */
export interface UserProductivityReport {
  userId: string;
  userName: string;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
  hoursLogged: number;
  averageTaskDuration: number;
  commentsAdded: number;
}

/**
 * Task Distribution Report - Breakdown by various dimensions
 */
export interface TaskDistributionReport {
  byPriority: { priority: TaskPriority; count: number; percentage: number }[];
  byAssignee: { userId: string; userName: string; count: number }[];
  byIssueType: { type: string; count: number }[];
}

/**
 * Trend Report - Time series data
 */
export interface TrendReport {
  period: 'week' | 'month' | 'quarter';
  tasksCreated: { date: string; count: number }[];
  tasksCompleted: { date: string; count: number }[];
  hoursLogged: { date: string; hours: number }[];
  velocity: number;
}

/**
 * Chart data format for visualizations
 */
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

/**
 * Helper function to convert priority enum to display name
 */
export function getPriorityDisplayName(priority: TaskPriority): string {
  const names: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: 'Low',
    [TaskPriority.MEDIUM]: 'Medium',
    [TaskPriority.HIGH]: 'High',
    [TaskPriority.URGENT]: 'Urgent',
  };
  return names[priority];
}

/**
 * Helper function to get priority color
 */
export function getPriorityColor(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: '#36B37E',
    [TaskPriority.MEDIUM]: '#FFAB00',
    [TaskPriority.HIGH]: '#FF5630',
    [TaskPriority.URGENT]: '#DE350B',
  };
  return colors[priority];
}
