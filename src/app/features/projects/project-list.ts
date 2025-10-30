import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { TaskService, NotificationService } from '../../core/services';
import { Task, TaskFilterDto, CreateTaskDto, UpdateTaskDto, TaskStatus } from '../../core/models';
import { TaskType } from '../../core/models/task-type.enum';
import { TASK_MESSAGES } from '../../core/constants/messages';
import {
  ConfirmDialogComponent,
  CreateTaskDialogComponent,
  TaskStatusBadgeComponent,
  TaskProgressBarComponent,
  TaskBlockDialogComponent
} from '../../shared/components';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule,
    MatPaginatorModule,
    MatChipsModule,
    TaskStatusBadgeComponent,
    TaskProgressBarComponent
  ],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListComponent implements OnInit {
  private taskService = inject(TaskService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  tasks = signal<Task[]>([]);
  loading = signal(false);
  displayedColumns: string[] = ['status', 'title', 'progress', 'priority', 'dueDate', 'actions'];

  // Pagination
  totalItems = signal(0);
  pageSize = 10;
  pageSizeOptions = [10, 20, 50];

  filters: TaskFilterDto = {
    type: TaskType.PROJECT,  // Filtrer uniquement les projets
    onlyRoot: true,   // Uniquement les projets racines
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  };

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading.set(true);
    this.notificationService.info('Chargement des projets...');

    this.taskService.findAll(this.filters).subscribe({
      next: (response) => {
        if (response && 'data' in response && 'meta' in response) {
          this.tasks.set(response.data);
          this.totalItems.set(response.meta.total);
        } else {
          this.tasks.set(response as any);
          this.totalItems.set((response as any).length || 0);
        }
        this.loading.set(false);
        this.notificationService.success(`${this.tasks().length} projet(s) chargé(s)`);
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.loading.set(false);
        this.notificationService.error('Erreur lors du chargement des projets');
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.filters.page = event.pageIndex + 1;
    this.filters.limit = event.pageSize;
    this.pageSize = event.pageSize;
    this.loadProjects();
  }

  openCreateProjectDialog() {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      data: { type: 'project' }  // Pré-remplir avec type=project
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createProject(result);
      }
    });
  }

  createProject(newProject: CreateTaskDto) {
    this.notificationService.info('Création du projet...');

    // Force le type à 'project'
    const projectData: CreateTaskDto = { ...newProject, type: TaskType.PROJECT };

    this.taskService.create(projectData).subscribe({
      next: () => {
        this.notificationService.success('Projet créé avec succès', 3000);
        this.loadProjects();
      },
      error: (err) => {
        console.error('Error creating project:', err);
        this.notificationService.error('Erreur lors de la création du projet', 4000);
      }
    });
  }

  toggleProject(id: string) {
    this.taskService.toggle(id).subscribe({
      next: () => {
        this.notificationService.success('Statut du projet mis à jour');
        this.loadProjects();
      },
      error: (err) => {
        console.error('Error toggling project:', err);
        this.notificationService.error('Erreur lors de la mise à jour');
      }
    });
  }

  deleteProject(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: 'Êtes-vous sûr de vouloir supprimer ce projet ? Toutes les tâches enfant seront également supprimées.'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.info('Suppression du projet...');

        this.taskService.remove(id).subscribe({
          next: () => {
            this.notificationService.success('Projet supprimé');
            this.loadProjects();
          },
          error: (err) => {
            console.error('Error deleting project:', err);
            this.notificationService.error('Erreur lors de la suppression');
          }
        });
      }
    });
  }

  editProject(task: Task) {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateProject(task.id, result);
      }
    });
  }

  updateProject(id: string, projectData: UpdateTaskDto) {
    this.notificationService.info('Mise à jour du projet...');

    this.taskService.update(id, projectData).subscribe({
      next: () => {
        this.notificationService.success('Projet mis à jour');
        this.loadProjects();
      },
      error: (err) => {
        console.error('Error updating project:', err);
        this.notificationService.error('Erreur lors de la mise à jour');
      }
    });
  }

  archiveProject(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: 'Êtes-vous sûr de vouloir archiver ce projet ?'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.info('Archivage du projet...');

        this.taskService.archiveTask(id).subscribe({
          next: () => {
            this.notificationService.success('Projet archivé');
            this.loadProjects();
          },
          error: (err) => {
            console.error('Error archiving project:', err);
            this.notificationService.error('Erreur lors de l\'archivage');
          }
        });
      }
    });
  }

  unarchiveProject(id: string) {
    this.notificationService.info('Restauration du projet...');

    this.taskService.unarchiveTask(id).subscribe({
      next: () => {
        this.notificationService.success('Projet restauré');
        this.loadProjects();
      },
      error: (err) => {
        console.error('Error unarchiving project:', err);
        this.notificationService.error('Erreur lors de la restauration');
      }
    });
  }

  blockProject(task: Task) {
    const dialogRef = this.dialog.open(TaskBlockDialogComponent, {
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.info('Blocage du projet...');

        this.taskService.blockTask(task.id, result.reason).subscribe({
          next: () => {
            this.notificationService.success('Projet bloqué');
            this.loadProjects();
          },
          error: (err) => {
            console.error('Error blocking project:', err);
            this.notificationService.error('Erreur lors du blocage');
          }
        });
      }
    });
  }

  unblockProject(id: string) {
    this.notificationService.info('Déblocage du projet...');

    this.taskService.unblockTask(id).subscribe({
      next: () => {
        this.notificationService.success('Projet débloqué');
        this.loadProjects();
      },
      error: (err) => {
        console.error('Error unblocking project:', err);
        this.notificationService.error('Erreur lors du déblocage');
      }
    });
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status !== TaskStatus.COMPLETED;
  }
}
