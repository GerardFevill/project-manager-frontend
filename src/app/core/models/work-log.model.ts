import { User } from './user.model';

export interface WorkLog {
  id: string;
  issueId: string;
  timeSpent: number; // in minutes
  description?: string;
  author: User;
  startedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkLogDto {
  timeSpent: number; // in minutes
  description?: string;
  startedAt: Date;
}

export interface UpdateWorkLogDto {
  timeSpent?: number;
  description?: string;
  startedAt?: Date;
}

export interface WorkLogListResponse {
  items: WorkLog[];
  total: number;
  totalTimeSpent: number; // sum of all time spent in minutes
}

export interface TimeTracking {
  timeEstimate?: number; // in minutes
  timeSpent: number; // in minutes
  timeRemaining?: number; // in minutes
  workLogs: WorkLog[];
}
