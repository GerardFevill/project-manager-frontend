import { User } from '../services/user.service';

export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return 'Unknown';
  if (user.displayName) return user.displayName;
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return fullName || user.username || user.email;
}
