import { User } from './user.model';

/**
 * WorkLog Model - Jira-style time tracking
 */
export interface WorkLog {
  id: string;
  timeSpent: number; // in hours
  description?: string;
  workDate: string;
  taskId: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a work log
 */
export interface CreateWorkLogDto {
  timeSpent: number;
  description?: string;
  workDate: string;
  taskId: string;
  userId: string;
}

/**
 * DTO for updating a work log
 */
export interface UpdateWorkLogDto {
  timeSpent?: number;
  description?: string;
  workDate?: string;
}

/**
 * Time tracking summary for a task
 */
export interface TimeTrackingSummary {
  totalLogged: number;
  logCount: number;
  lastLogDate: string | null;
}

/**
 * Format hours to human-readable format
 * Examples: 1.5h -> "1h 30m", 2h -> "2h", 0.25h -> "15m"
 */
export function formatHours(hours: number): string {
  if (hours === 0) return '0h';

  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Parse time string to hours
 * Examples: "1h 30m" -> 1.5, "2h" -> 2, "45m" -> 0.75
 */
export function parseTimeString(timeStr: string): number {
  const hourMatch = timeStr.match(/(\d+)h/);
  const minMatch = timeStr.match(/(\d+)m/);

  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minMatch ? parseInt(minMatch[1]) : 0;

  return hours + (minutes / 60);
}
