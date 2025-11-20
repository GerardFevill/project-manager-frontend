import { User } from './user.model';

export interface Comment {
  id: string;
  issueId: string;
  body: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  edited?: boolean;
}

export interface CreateCommentDto {
  body: string;
}

export interface UpdateCommentDto {
  body: string;
}

export interface CommentListResponse {
  items: Comment[];
  total: number;
  page: number;
  pageSize: number;
}
