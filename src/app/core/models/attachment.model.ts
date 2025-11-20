import { User } from './user.model';

export interface Attachment {
  id: string;
  issueId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number; // in bytes
  url: string;
  thumbnailUrl?: string;
  uploadedBy: User;
  createdAt: Date;
}

export interface AttachmentUploadProgress {
  file: File;
  progress: number; // 0-100
  uploaded: boolean;
  error?: string;
}

export interface AttachmentListResponse {
  items: Attachment[];
  total: number;
}
