import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  timezone?: string;
  locale?: string;
  isActive: boolean;
  isAdmin: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdDate: Date;
  updatedDate: Date;
  roles?: any[];
  groups?: any[];
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  timezone?: string;
  locale?: string;
  isActive?: boolean;
  isAdmin?: boolean;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  lastPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;

  // Signals for reactive state
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Cache for quick access
  private usersCache = new Map<string, User>();
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all users with optional pagination
   */
  getUsers(page = 1, pageSize = 50): Observable<PaginatedUsers> {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedUsers>(this.API_URL, { params }).pipe(
      tap(response => {
        const users = response?.data || [];
        users.forEach(user => this.usersCache.set(user.id, user));
        this.users.set(users);
        this.usersSubject.next(users);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load users');
        this.loading.set(false);
        console.error('Error loading users:', error);
        return of({ data: [], total: 0, page: 1, lastPage: 1 });
      })
    );
  }

  /**
   * Get a single user by ID
   */
  getUserById(id: string): Observable<User> {
    // Check cache first
    const cached = this.usersCache.get(id);
    if (cached) {
      return of(cached);
    }

    return this.http.get<User>(`${this.API_URL}/${id}`).pipe(
      tap(user => {
        this.usersCache.set(user.id, user);
        this.users.update(users => {
          const index = users.findIndex(u => u.id === id);
          if (index >= 0) {
            users[index] = user;
            return [...users];
          }
          return [...users, user];
        });
      }),
      catchError(error => {
        console.error('Error loading user:', error);
        throw error;
      })
    );
  }

  /**
   * Create a new user
   */
  createUser(dto: CreateUserDto): Observable<User> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<User>(this.API_URL, dto).pipe(
      tap(newUser => {
        this.usersCache.set(newUser.id, newUser);
        this.users.update(users => [...users, newUser]);
        this.usersSubject.next(this.users());
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to create user');
        this.loading.set(false);
        console.error('Error creating user:', error);
        throw error;
      })
    );
  }

  /**
   * Update an existing user
   */
  updateUser(id: string, dto: UpdateUserDto): Observable<User> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.patch<User>(`${this.API_URL}/${id}`, dto).pipe(
      tap(updatedUser => {
        this.usersCache.set(updatedUser.id, updatedUser);
        this.users.update(users =>
          users.map(user => user.id === id ? updatedUser : user)
        );
        this.usersSubject.next(this.users());
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to update user');
        this.loading.set(false);
        console.error('Error updating user:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.usersCache.delete(id);
        this.users.update(users => users.filter(user => user.id !== id));
        this.usersSubject.next(this.users());
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to delete user');
        this.loading.set(false);
        console.error('Error deleting user:', error);
        throw error;
      })
    );
  }

  /**
   * Deactivate a user (soft delete)
   */
  deactivateUser(id: string): Observable<User> {
    return this.updateUser(id, { isActive: false });
  }

  /**
   * Activate a user
   */
  activateUser(id: string): Observable<User> {
    return this.updateUser(id, { isActive: true });
  }

  /**
   * Get cached user
   */
  getCachedUser(id: string): User | undefined {
    return this.usersCache.get(id);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.usersCache.clear();
  }
}
