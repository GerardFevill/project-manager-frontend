import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { UserFormDialogComponent } from '../../shared/components/user-form/user-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserService, User, CreateUserDto, UpdateUserDto } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    AvatarComponent,
    UserFormDialogComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');

  showUserDialog = signal(false);
  selectedUser = signal<User | null>(null);

  // Confirmation dialogs
  showDeactivateDialog = signal(false);
  showDeleteDialog = signal(false);
  userToAction = signal<User | null>(null);

  filteredUsers = computed(() => {
    let filtered = this.users();

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(user => {
        const userName = this.getUserDisplayName(user).toLowerCase();
        return userName.includes(query) ||
               user.email?.toLowerCase().includes(query) ||
               user.username?.toLowerCase().includes(query);
      });
    }

    return filtered;
  });

  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getUsers(1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users.set(response?.data || []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load users:', err);
          this.error.set('Failed to load users. Please try again.');
          this.users.set([]);
          this.loading.set(false);
        }
      });
  }

  refreshUsers(): void {
    this.loadUsers();
  }

  createUser(): void {
    this.selectedUser.set(null);
    this.showUserDialog.set(true);
  }

  editUser(user: User): void {
    this.selectedUser.set(user);
    this.showUserDialog.set(true);
  }

  onUserSubmit(dto: CreateUserDto | UpdateUserDto): void {
    const isEdit = !!this.selectedUser();

    const operation = isEdit
      ? this.userService.updateUser(this.selectedUser()!.id, dto as UpdateUserDto)
      : this.userService.createUser(dto as CreateUserDto);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user) => {
        const userName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
        this.toastService.success(
          `User ${isEdit ? 'updated' : 'created'} successfully`,
          `${userName} has been ${isEdit ? 'updated' : 'created'}`
        );
        this.closeDialog();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to save user:', err);
        const errorMessage = this.getErrorMessage(err);
        this.toastService.error(
          `Failed to ${isEdit ? 'update' : 'create'} user`,
          errorMessage
        );
      }
    });
  }

  private getErrorMessage(error: any): string {
    // Handle validation errors from backend
    if (error.error?.message) {
      if (Array.isArray(error.error.message)) {
        // NestJS validation errors
        const messages = error.error.message;
        if (messages.length > 0) {
          // Return first error message
          return messages[0];
        }
      } else if (typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    // Handle specific error codes
    if (error.status === 409) {
      return 'Username or email already exists';
    }
    if (error.status === 400) {
      return 'Invalid input. Please check your data';
    }
    if (error.status === 401) {
      return 'Unauthorized. Please login again';
    }
    if (error.status === 403) {
      return 'You do not have permission to perform this action';
    }
    if (error.status === 404) {
      return 'User not found';
    }
    if (error.status === 500) {
      return 'Server error. Please try again later';
    }

    return 'An unexpected error occurred. Please try again';
  }

  toggleUserStatus(user: User): void {
    this.userToAction.set(user);
    this.showDeactivateDialog.set(true);
  }

  confirmToggleUserStatus(): void {
    const user = this.userToAction();
    if (!user) return;

    const newStatus = !user.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    const userName = this.getUserDisplayName(user);

    const operation = newStatus
      ? this.userService.activateUser(user.id)
      : this.userService.deactivateUser(user.id);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.toastService.success(`User ${action}d`, `${userName} has been ${action}d successfully`);
        this.loadUsers();
        this.closeConfirmDialogs();
      },
      error: (err) => {
        console.error(`Failed to ${action} user:`, err);
        const errorMessage = this.getErrorMessage(err);
        this.toastService.error(`Failed to ${action} user`, errorMessage);
        this.closeConfirmDialogs();
      }
    });
  }

  deleteUser(user: User): void {
    this.userToAction.set(user);
    this.showDeleteDialog.set(true);
  }

  confirmDeleteUser(): void {
    const user = this.userToAction();
    if (!user) return;

    const userName = this.getUserDisplayName(user);

    this.userService.deleteUser(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('User deleted', `${userName} has been permanently deleted`);
          this.loadUsers();
          this.closeConfirmDialogs();
        },
        error: (err) => {
          console.error('Failed to delete user:', err);
          const errorMessage = this.getErrorMessage(err);
          this.toastService.error('Failed to delete user', errorMessage);
          this.closeConfirmDialogs();
        }
      });
  }

  closeConfirmDialogs(): void {
    this.showDeactivateDialog.set(false);
    this.showDeleteDialog.set(false);
    this.userToAction.set(null);
  }

  closeDialog(): void {
    this.showUserDialog.set(false);
    this.selectedUser.set(null);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  getUserDisplayName(user: User): string {
    if (user.displayName) return user.displayName;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.username || user.email;
  }

  getRoleBadgeVariant(role: string): any {
    const variants: Record<string, string> = {
      admin: 'danger',
      developer: 'primary',
      viewer: 'default'
    };
    return variants[role] || 'default';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
