import { TaskStatus, TaskRecurrence } from './task-enums';

/**
 * Main Task Interface
 * Represents a fractal/hierarchical task with full feature set
 */
export interface Task {
  // Identity
  id: string;
  title: string;
  description: string | null;

  // Status & Progress
  status: TaskStatus;
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Dates
  dueDate: Date | null;
  startDate: Date | null;
  completedAt: Date | null;

  // Recurrence
  recurrence: TaskRecurrence;
  nextOccurrence: Date | null;
  lastOccurrence: Date | null;

  // Fractal structure
  level: number;
  parentId: string | null;
  parent?: Task;
  children?: Task[];

  // Flexible data
  tags: string[];
  metadata: Record<string, any> | null;

  // Time tracking
  estimatedHours: number | null;
  actualHours: number | null;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * DTO for creating a new task
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  progress?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  startDate?: string;
  recurrence?: TaskRecurrence;
  nextOccurrence?: string;
  parentId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  estimatedHours?: number;
}

/**
 * DTO for updating an existing task
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  progress?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  startDate?: string;
  recurrence?: TaskRecurrence;
  nextOccurrence?: string;
  parentId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  estimatedHours?: number;
  actualHours?: number;
}

/**
 * Advanced filters for task queries
 */
export interface TaskFilterDto {
  // Status & Priority
  status?: TaskStatus | 'all';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  recurrence?: TaskRecurrence;

  // Hierarchical filters
  onlyRoot?: boolean;
  parentId?: string;

  // Date filters
  onlyOverdue?: boolean;
  dueDateMin?: string;
  dueDateMax?: string;

  // Progress filter
  progressMin?: number;
  progressMax?: number;

  // Tags & Search
  tags?: string[];
  search?: string;

  // Pagination & Sorting
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';

  // Include archived
  includeArchived?: boolean;
}

/**
 * DTO for blocking a task
 */
export interface BlockTaskDto {
  reason?: string;
}

/**
 * Task History Entry
 */
export interface TaskHistory {
  id: string;
  taskId: string;
  action: string;
  statusAtExecution: TaskStatus;
  progressAtExecution: number;
  duration: number | null;
  metadata: Record<string, any> | null;
  executedAt: Date;
}

/**
 * Task Progress Details
 */
export interface TaskProgress {
  taskId: string;
  currentProgress: number;
  childrenProgress?: Array<{
    id: string;
    title: string;
    progress: number;
  }>;
  timeline?: Array<{
    date: Date;
    progress: number;
    action: string;
  }>;
}

/**
 * Task Statistics
 */
export interface TaskStats {
  total: number;
  byStatus: {
    draft: number;
    active: number;
    completed: number;
    blocked: number;
    recurring: number;
    archived: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  overdue: number;
  completionRate: number;
  avgProgress: number;
  upcomingRecurrences: number;
}
