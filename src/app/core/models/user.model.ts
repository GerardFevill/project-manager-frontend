export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'admin' | 'developer' | 'viewer';
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role?: 'admin' | 'developer' | 'viewer';
  avatar?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'admin' | 'developer' | 'viewer';
  avatar?: string;
  active?: boolean;
}
