import { User } from './user.model';

/**
 * Comment Model - Jira-style comments for tasks
 */
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author?: User;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a comment
 */
export interface CreateCommentDto {
  content: string;
  taskId: string;
  authorId: string;
}

/**
 * DTO for updating a comment
 */
export interface UpdateCommentDto {
  content: string;
}
