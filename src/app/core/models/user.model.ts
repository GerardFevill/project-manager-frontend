/**
 * User Roles - Jira style
 */
export enum UserRole {
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: UserRole;
  jobTitle?: string;
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role?: UserRole;
  jobTitle?: string;
  department?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: UserRole;
  jobTitle?: string;
  department?: string;
  isActive?: boolean;
}

/**
 * Get full name of user
 */
export function getUserFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

/**
 * Get initials for avatar display
 */
export function getUserInitials(user: User): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}
