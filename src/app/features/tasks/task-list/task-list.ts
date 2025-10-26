import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TaskService, NotificationService } from '../../../core/services';
import { Task, TaskFilterDto, CreateTaskDto, UpdateTaskDto, TaskStatus } from '../../../core/models';
import { TASK_MESSAGES } from '../../../core/constants/messages';
import {
  ConfirmDialogComponent,
  CreateTaskDialogComponent,
  TaskStatusBadgeComponent,
  TaskProgressBarComponent,
  TaskBlockDialogComponent
} from '../../../shared/components';
import { TaskTypeBadgeComponent } from '../../../shared/components/task-type-badge/task-type-badge.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule,
    MatPaginatorModule,
    TaskStatusBadgeComponent,
    TaskProgressBarComponent,
    TaskTypeBadgeComponent
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskListComponent implements OnInit, OnDestroy {
  private taskService = inject(TaskService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  // Subject pour debounce des changements de filtres
  private filterChange$ = new Subject<void>();

  tasks = signal<Task[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['status', 'type', 'title', 'progress', 'priority', 'tags', 'dueDate', 'actions'];
  TaskStatus = TaskStatus;

  // Pagination
  totalItems = signal(0);
  pageSize = 10;
  pageSizeOptions = [10, 20, 50, 100];

  filters: TaskFilterDto = {
    status: 'all',
    onlyRoot: true,
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  };

  // Multi-select filters (envoyés au serveur)
  selectedStatuses: (TaskStatus | 'all')[] = [];
  selectedPriorities: ('low' | 'medium' | 'high' | 'urgent' | 'all')[] = [];

  allStatuses: TaskStatus[] = [
    TaskStatus.DRAFT,
    TaskStatus.ACTIVE,
    TaskStatus.COMPLETED,
    TaskStatus.BLOCKED,
    TaskStatus.RECURRING,
    TaskStatus.ARCHIVED
  ];

  allPriorities: ('low' | 'medium' | 'high' | 'urgent')[] = ['low', 'medium', 'high', 'urgent'];

  ngOnInit() {
    // S'abonner aux changements de filtres avec debounce de 300ms
    this.filterChange$.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.loadTasks();
    });

    // Charger les tâches initialement
    this.loadTasks();
  }

  ngOnDestroy() {
    // Nettoyer la subscription
    this.filterChange$.complete();
  }

  loadTasks() {
    this.loading.set(true);
    this.notificationService.info(TASK_MESSAGES.LOADING);

    // Préparer les filtres server-side
    const serverFilters = { ...this.filters };

    // Envoyer les statuts sélectionnés
    // Si 'all' est présent ou aucun filtre, ne pas envoyer de filtres
    if (this.selectedStatuses.includes('all') || this.selectedStatuses.length === 0) {
      // Pas de filtre de statut
      delete serverFilters.statuses;
      delete serverFilters.status;
    } else {
      // Filtrer par les statuts sélectionnés
      const statusFilters = this.selectedStatuses.filter(s => s !== 'all') as TaskStatus[];
      serverFilters.statuses = statusFilters;
      delete serverFilters.status;
    }

    // Envoyer les priorités sélectionnées
    // Si 'all' est présent ou aucun filtre, ne pas envoyer de filtres
    if (this.selectedPriorities.includes('all') || this.selectedPriorities.length === 0) {
      // Pas de filtre de priorité
      delete serverFilters.priorities;
      delete serverFilters.priority;
    } else {
      // Filtrer par les priorités sélectionnées
      const priorityFilters = this.selectedPriorities.filter(p => p !== 'all') as ('low' | 'medium' | 'high' | 'urgent')[];
      serverFilters.priorities = priorityFilters;
      delete serverFilters.priority;
    }

    this.taskService.findAll(serverFilters).subscribe({
      next: (response) => {
        // Handle both paginated and non-paginated responses
        if (response && 'data' in response && 'meta' in response) {
          // Paginated response
          this.tasks.set(response.data);
          this.totalItems.set(response.meta.total);
        } else {
          // Non-paginated response (fallback for compatibility)
          this.tasks.set(response as any);
          this.totalItems.set((response as any).length || 0);
        }
        this.loading.set(false);
        this.notificationService.success(TASK_MESSAGES.LOADED(this.tasks().length));
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.loading.set(false);
        this.notificationService.error(TASK_MESSAGES.LOAD_ERROR);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.filters.page = event.pageIndex + 1;
    this.filters.limit = event.pageSize;
    this.pageSize = event.pageSize;
    this.loadTasks();
  }

  onStatusFilterChange() {
    // Use setTimeout to let Angular update the model first
    setTimeout(() => {
      const hasAll = this.selectedStatuses.includes('all');
      const individualStatuses = this.selectedStatuses.filter(s => s !== 'all') as TaskStatus[];
      const allIndividualSelected = this.allStatuses.every(s => individualStatuses.includes(s));

      if (hasAll && individualStatuses.length === 0) {
        // Si seulement "all" est sélectionné, tout afficher (garder juste "all")
        this.selectedStatuses = ['all'];
      } else if (hasAll && individualStatuses.length > 0) {
        // Si "all" + des items individuels, garder seulement les items individuels
        this.selectedStatuses = individualStatuses;
      } else if (!hasAll && allIndividualSelected) {
        // Si tous les items individuels sont sélectionnés, ajouter "all"
        this.selectedStatuses = ['all'];
      }

      // Recharger depuis le serveur avec les nouveaux filtres (avec debounce)
      this.filters.page = 1;
      this.filterChange$.next();
    }, 0);
  }

  onPriorityFilterChange() {
    // Use setTimeout to let Angular update the model first
    setTimeout(() => {
      const hasAll = this.selectedPriorities.includes('all');
      const individualPriorities = this.selectedPriorities.filter(p => p !== 'all') as ('low' | 'medium' | 'high' | 'urgent')[];
      const allIndividualSelected = this.allPriorities.every(p => individualPriorities.includes(p));

      if (hasAll && individualPriorities.length === 0) {
        // Si seulement "all" est sélectionné, tout afficher (garder juste "all")
        this.selectedPriorities = ['all'];
      } else if (hasAll && individualPriorities.length > 0) {
        // Si "all" + des items individuels, garder seulement les items individuels
        this.selectedPriorities = individualPriorities;
      } else if (!hasAll && allIndividualSelected) {
        // Si tous les items individuels sont sélectionnés, ajouter "all"
        this.selectedPriorities = ['all'];
      }

      // Recharger depuis le serveur avec les nouveaux filtres (avec debounce)
      this.filters.page = 1;
      this.filterChange$.next();
    }, 0);
  }

  openCreateTaskDialog() {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createTask(result);
      }
    });
  }

  createTask(newTask: CreateTaskDto) {
    this.notificationService.info(TASK_MESSAGES.CREATING);

    this.taskService.create(newTask).subscribe({
      next: () => {
        this.notificationService.success(TASK_MESSAGES.CREATED, 3000);
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error creating task:', err);
        this.notificationService.error(TASK_MESSAGES.CREATE_ERROR, 4000);
      }
    });
  }

  toggleTask(id: string) {
    this.taskService.toggle(id).subscribe({
      next: () => {
        this.notificationService.success(TASK_MESSAGES.UPDATED);
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error toggling task:', err);
        this.notificationService.error(TASK_MESSAGES.UPDATE_ERROR);
      }
    });
  }

  deleteTask(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: TASK_MESSAGES.CONFIRM_DELETE
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.info(TASK_MESSAGES.DELETING);

        this.taskService.remove(id).subscribe({
          next: () => {
            this.notificationService.success(TASK_MESSAGES.DELETED);
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error deleting task:', err);
            this.notificationService.error(TASK_MESSAGES.DELETE_ERROR);
          }
        });
      }
    });
  }

  viewChildren(id: string) {
    this.filters.parentId = id;
    this.filters.onlyRoot = false;
    this.loadTasks();
  }

  editTask(task: Task) {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateTask(task.id, result);
      }
    });
  }

  updateTask(id: string, taskData: UpdateTaskDto) {
    this.notificationService.info(TASK_MESSAGES.UPDATING);

    this.taskService.update(id, taskData).subscribe({
      next: () => {
        this.notificationService.success(TASK_MESSAGES.UPDATED);
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.notificationService.error(TASK_MESSAGES.UPDATE_ERROR);
      }
    });
  }

  duplicateTask(task: Task) {
    const duplicatedTask: CreateTaskDto = {
      title: `${task.title} (copie)`,
      description: task.description || undefined,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined
    };

    this.notificationService.info(TASK_MESSAGES.DUPLICATING);

    this.taskService.create(duplicatedTask).subscribe({
      next: () => {
        this.notificationService.success(TASK_MESSAGES.DUPLICATED, 3000);
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error duplicating task:', err);
        this.notificationService.error(TASK_MESSAGES.DUPLICATE_ERROR, 4000);
      }
    });
  }

  viewTask(task: Task) {
    this.notificationService.info(TASK_MESSAGES.VIEWING(task.title));
  }

  // ========================================================================
  // NEW ACTIONS: Block, Archive, Progress
  // ========================================================================

  blockTask(task: Task) {
    const dialogRef = this.dialog.open(TaskBlockDialogComponent, {
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.info('Blocage de la tâche...');

        this.taskService.blockTask(task.id, result.reason).subscribe({
          next: () => {
            this.notificationService.success('Tâche bloquée avec succès');
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error blocking task:', err);
            this.notificationService.error('Erreur lors du blocage de la tâche');
          }
        });
      }
    });
  }

  unblockTask(id: string) {
    this.notificationService.info('Déblocage de la tâche...');

    this.taskService.unblockTask(id).subscribe({
      next: () => {
        this.notificationService.success('Tâche débloquée avec succès');
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error unblocking task:', err);
        this.notificationService.error('Erreur lors du déblocage de la tâche');
      }
    });
  }

  archiveTask(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: 'Êtes-vous sûr de vouloir archiver cette tâche ?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.info('Archivage de la tâche...');

        this.taskService.archiveTask(id).subscribe({
          next: () => {
            this.notificationService.success('Tâche archivée avec succès');
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error archiving task:', err);
            this.notificationService.error('Erreur lors de l\'archivage de la tâche');
          }
        });
      }
    });
  }

  unarchiveTask(id: string) {
    this.notificationService.info('Restauration de la tâche...');

    this.taskService.unarchiveTask(id).subscribe({
      next: () => {
        this.notificationService.success('Tâche restaurée avec succès');
        this.loadTasks();
      },
      error: (err) => {
        console.error('Error unarchiving task:', err);
        this.notificationService.error('Erreur lors de la restauration de la tâche');
      }
    });
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status !== TaskStatus.COMPLETED;
  }

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      // Réinitialiser au tri par défaut
      this.filters.sortBy = 'createdAt';
      this.filters.sortOrder = 'DESC';
    } else {
      // Envoyer le tri au serveur
      this.filters.sortBy = sort.active;
      this.filters.sortOrder = sort.direction === 'asc' ? 'ASC' : 'DESC';
    }

    // Recharger depuis le serveur avec le nouveau tri
    this.loadTasks();
  }
}
