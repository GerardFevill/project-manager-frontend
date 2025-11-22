import { User } from '../services/user.service';
import { Project } from '../services/project.service';

/**
 * Epic status types
 */
export type EpicStatus = 'to-do' | 'in-progress' | 'done' | 'cancelled';

/**
 * Epic interface - represents a large body of work that can be broken down into smaller stories
 */
export interface Epic {
  id: string;
  key: string;
  name: string;
  description?: string;
  status: EpicStatus;
  color?: string;

  // Relationships
  projectId?: string;
  project?: Project;
  initiativeId?: string;

  // Progress tracking
  totalIssues?: number;
  completedIssues?: number;
  inProgressIssues?: number;
  todoIssues?: number;
  totalPoints?: number;
  completedPoints?: number;
  progress?: number;

  // Dates
  startDate?: Date;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Optional fields
  lead?: User;
  labels?: string[];
}

/**
 * DTO for creating a new epic
 */
export interface CreateEpicDto {
  name: string;
  description?: string;
  color?: string;
  status?: EpicStatus;
  projectId?: string;
  initiativeId?: string;
  startDate?: Date;
  targetDate?: Date;
  labels?: string[];
}

/**
 * DTO for updating an epic
 */
export interface UpdateEpicDto {
  name?: string;
  description?: string;
  color?: string;
  status?: EpicStatus;
  projectId?: string;
  initiativeId?: string;
  startDate?: Date;
  targetDate?: Date;
  labels?: string[];
}

/**
 * Paginated epic response
 */
export interface PaginatedEpics {
  items: Epic[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

/**
 * Epic progress data for charts and visualizations
 */
export interface EpicProgress {
  id: string;
  key: string;
  summary: string;
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  progress: number;
  storyPoints?: {
    total: number;
    completed: number;
    remaining: number;
  };
}

/**
 * Predefined epic colors
 */
export const EPIC_COLORS = [
  { name: 'Purple', hex: '#904EE2', class: 'epic-purple' },
  { name: 'Blue', hex: '#4BADE8', class: 'epic-blue' },
  { name: 'Green', hex: '#63BA3C', class: 'epic-green' },
  { name: 'Orange', hex: '#FF991F', class: 'epic-orange' },
  { name: 'Red', hex: '#E5493A', class: 'epic-red' },
  { name: 'Pink', hex: '#E94B8A', class: 'epic-pink' },
  { name: 'Teal', hex: '#00B8D9', class: 'epic-teal' },
  { name: 'Yellow', hex: '#FFC400', class: 'epic-yellow' },
] as const;

/**
 * Epic status display configuration
 */
export const EPIC_STATUS_CONFIG = {
  'to-do': {
    label: 'To Do',
    color: 'var(--jira-neutral-500)',
    icon: 'circle',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'var(--jira-info)',
    icon: 'play',
  },
  'done': {
    label: 'Done',
    color: 'var(--jira-success)',
    icon: 'check',
  },
  'cancelled': {
    label: 'Cancelled',
    color: 'var(--jira-neutral-400)',
    icon: 'times',
  },
} as const;
