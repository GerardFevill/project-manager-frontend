/**
 * Task Status Enum
 * Represents all possible states of a task
 */
export enum TaskStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  RECURRING = 'recurring',
  ARCHIVED = 'archived'
}

/**
 * Task Recurrence Enum
 * Defines the frequency of recurring tasks
 */
export enum TaskRecurrence {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

/**
 * Helper functions for Task Status
 */
export const TaskStatusHelper = {
  getLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      [TaskStatus.DRAFT]: 'Brouillon',
      [TaskStatus.ACTIVE]: 'Active',
      [TaskStatus.COMPLETED]: 'Terminée',
      [TaskStatus.BLOCKED]: 'Bloquée',
      [TaskStatus.RECURRING]: 'Récurrente',
      [TaskStatus.ARCHIVED]: 'Archivée'
    };
    return labels[status];
  },

  getColor(status: TaskStatus): string {
    const colors: Record<TaskStatus, string> = {
      [TaskStatus.DRAFT]: '#6c757d',      // Gray
      [TaskStatus.ACTIVE]: '#0d6efd',     // Blue
      [TaskStatus.COMPLETED]: '#198754',  // Green
      [TaskStatus.BLOCKED]: '#dc3545',    // Red
      [TaskStatus.RECURRING]: '#fd7e14',  // Orange
      [TaskStatus.ARCHIVED]: '#495057'    // Dark gray
    };
    return colors[status];
  },

  getIcon(status: TaskStatus): string {
    const icons: Record<TaskStatus, string> = {
      [TaskStatus.DRAFT]: 'edit',
      [TaskStatus.ACTIVE]: 'play_arrow',
      [TaskStatus.COMPLETED]: 'check_circle',
      [TaskStatus.BLOCKED]: 'block',
      [TaskStatus.RECURRING]: 'repeat',
      [TaskStatus.ARCHIVED]: 'archive'
    };
    return icons[status];
  }
};

/**
 * Helper functions for Task Recurrence
 */
export const TaskRecurrenceHelper = {
  getLabel(recurrence: TaskRecurrence): string {
    const labels: Record<TaskRecurrence, string> = {
      [TaskRecurrence.NONE]: 'Aucune',
      [TaskRecurrence.DAILY]: 'Quotidienne',
      [TaskRecurrence.WEEKLY]: 'Hebdomadaire',
      [TaskRecurrence.MONTHLY]: 'Mensuelle',
      [TaskRecurrence.YEARLY]: 'Annuelle'
    };
    return labels[recurrence];
  }
};
