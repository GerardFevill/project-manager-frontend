export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  level: number;
  parentId: string | null;
  parent?: Task;
  children?: Task[];
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  parentId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  parentId?: string;
}

export interface TaskFilterDto {
  status?: 'all' | 'active' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  onlyOverdue?: boolean;
  onlyRoot?: boolean;
  parentId?: string;
}

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  completionRate: number;
}
