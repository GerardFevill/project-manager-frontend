import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { ProjectFormDialogComponent } from '../../shared/components/project-form/project-form-dialog.component';
import { ProjectService, Project, CreateProjectDto, UpdateProjectDto } from '../../core/services/project.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent,
    AvatarComponent,
    ProjectFormDialogComponent
  ],
  template: `
    <div class="projects-page">
      <!-- Header -->
      <div class="projects-header">
        <div class="header-title">
          <h1>Project Management</h1>
          <span class="project-count" *ngIf="!loading()">
            {{ projects().length }} projects
          </span>
        </div>

        <div class="header-actions">
          <jira-button
            variant="subtle"
            size="medium"
            (clicked)="refreshProjects()"
            [disabled]="loading()"
          >
            <jira-icon leftIcon name="arrow-up" [size]="16" />
            Refresh
          </jira-button>

          <jira-button
            variant="primary"
            size="medium"
            (clicked)="createProject()"
          >
            <jira-icon leftIcon name="plus" [size]="16" />
            Create Project
          </jira-button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters" *ngIf="!loading()">
        <div class="search-bar">
          <jira-icon name="search" [size]="16" />
          <input
            type="text"
            placeholder="Search projects by name or key..."
            [value]="searchQuery()"
            (input)="onSearchChange($event)"
          />
        </div>

        <div class="filter-tabs">
          <button
            class="filter-tab"
            [class.active]="typeFilter() === 'all'"
            (click)="typeFilter.set('all')"
          >
            All Types
          </button>
          <button
            class="filter-tab"
            [class.active]="typeFilter() === 'software'"
            (click)="typeFilter.set('software')"
          >
            <jira-icon name="code" [size]="14" />
            Software
          </button>
          <button
            class="filter-tab"
            [class.active]="typeFilter() === 'business'"
            (click)="typeFilter.set('business')"
          >
            <jira-icon name="briefcase" [size]="14" />
            Business
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading-state">
        <div class="spinner"></div>
        <p>Loading projects...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading() && error()" class="error-state">
        <jira-icon name="warning" [size]="48" color="var(--jira-danger)" />
        <p>{{ error() }}</p>
        <jira-button variant="primary" (clicked)="refreshProjects()">
          Retry
        </jira-button>
      </div>

      <!-- Projects Grid -->
      <div *ngIf="!loading() && !error()" class="projects-container">
        <div class="projects-grid" *ngIf="filteredProjects().length > 0">
          <div class="project-card" *ngFor="let project of filteredProjects()">
            <div class="project-header">
              <div class="project-avatar">
                <jira-avatar
                  [name]="project.name"
                  [src]="project.avatar"
                  size="large"
                />
              </div>
              <div class="project-actions">
                <button class="action-btn" (click)="setAsCurrentProject(project)" title="Set as Current">
                  <jira-icon name="star" [size]="16" />
                </button>
                <button class="action-btn" (click)="editProject(project)" title="Edit">
                  <jira-icon name="edit" [size]="16" />
                </button>
                <button class="action-btn danger" (click)="deleteProject(project)" title="Delete">
                  <jira-icon name="delete" [size]="16" />
                </button>
              </div>
            </div>

            <div class="project-body">
              <div class="project-title">
                <h3>{{ project.name }}</h3>
                <jira-badge variant="primary">{{ project.key }}</jira-badge>
              </div>
              <p class="project-description" *ngIf="project.description">
                {{ project.description }}
              </p>
              <p class="project-description empty" *ngIf="!project.description">
                No description provided
              </p>
            </div>

            <div class="project-footer">
              <div class="project-meta">
                <div class="meta-item" *ngIf="project.lead">
                  <jira-icon name="user" [size]="14" />
                  <span>{{ project.lead.displayName }}</span>
                </div>
                <div class="meta-item" *ngIf="!project.lead">
                  <jira-icon name="user" [size]="14" />
                  <span class="no-lead">No lead</span>
                </div>
                <div class="meta-item">
                  <jira-icon name="list" [size]="14" />
                  <span>{{ project.issueCount || 0 }} issues</span>
                </div>
                <div class="meta-item" *ngIf="project.projectType">
                  <jira-icon [name]="project.projectType === 'software' ? 'code' : 'briefcase'" [size]="14" />
                  <span>{{ project.projectType | titlecase }}</span>
                </div>
              </div>
              <div class="project-date">
                Created {{ formatDate(project.createdAt) }}
              </div>
            </div>

            <div class="current-badge" *ngIf="isCurrentProject(project)">
              <jira-icon name="star" [size]="12" />
              Current Project
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredProjects().length === 0">
          <jira-icon name="folder" [size]="64" color="var(--jira-neutral-400)" />
          <h3>No projects found</h3>
          <p>Try adjusting your filters or create a new project</p>
          <jira-button variant="primary" (clicked)="createProject()">
            <jira-icon leftIcon name="plus" [size]="16" />
            Create Project
          </jira-button>
        </div>
      </div>
    </div>

    <!-- Project Form Dialog -->
    <app-project-form-dialog
      *ngIf="showProjectDialog()"
      [project]="selectedProject()"
      (submit)="onProjectSubmit($event)"
      (cancel)="closeDialog()"
    />
  `,
  styles: [`
    .projects-page { padding: var(--spacing-xl); max-width: 1600px; margin: 0 auto; }

    .projects-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xl); }
    .header-title { display: flex; align-items: baseline; gap: var(--spacing-md); }
    h1 { margin: 0; font-size: var(--font-size-3xl); font-weight: var(--font-weight-semibold); }
    .project-count { font-size: var(--font-size-md); color: var(--jira-neutral-600); background: var(--jira-neutral-100); padding: var(--spacing-xs) var(--spacing-sm); border-radius: var(--radius-sm); }
    .header-actions { display: flex; gap: var(--spacing-sm); }

    .filters { display: flex; flex-direction: column; gap: var(--spacing-md); margin-bottom: var(--spacing-xl); }
    .search-bar { flex: 1; display: flex; align-items: center; gap: var(--spacing-sm); padding: var(--spacing-sm) var(--spacing-md); background: var(--jira-neutral-0); border: 1px solid var(--jira-neutral-200); border-radius: var(--radius-md); }
    .search-bar input { flex: 1; border: none; outline: none; font-size: var(--font-size-md); background: transparent; color: var(--jira-neutral-1000); }
    .filter-tabs { display: flex; gap: var(--spacing-xs); }
    .filter-tab { display: flex; align-items: center; gap: var(--spacing-xs); padding: var(--spacing-sm) var(--spacing-md); border: none; background: var(--jira-neutral-0); border-radius: var(--radius-md); cursor: pointer; font-size: var(--font-size-sm); color: var(--jira-neutral-700); transition: all 0.2s; }
    .filter-tab:hover { background: var(--jira-neutral-100); }
    .filter-tab.active { background: var(--jira-brand-primary); color: var(--jira-neutral-0); }

    .loading-state, .error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--spacing-3xl); gap: var(--spacing-md); }
    .spinner { width: 48px; height: 48px; border: 4px solid var(--jira-neutral-200); border-top-color: var(--jira-brand-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .projects-container { background: transparent; }
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: var(--spacing-lg); }

    .project-card { position: relative; background: var(--jira-neutral-0); border: 1px solid var(--jira-neutral-200); border-radius: var(--radius-lg); padding: var(--spacing-lg); display: flex; flex-direction: column; gap: var(--spacing-md); transition: all 0.2s; }
    .project-card:hover { box-shadow: var(--shadow-md); border-color: var(--jira-brand-primary); }

    .project-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .project-avatar { }
    .project-actions { display: flex; gap: var(--spacing-xs); }
    .action-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; background: transparent; border-radius: var(--radius-sm); cursor: pointer; transition: background 0.2s; }
    .action-btn:hover { background: var(--jira-neutral-200); }
    .action-btn.danger:hover { background: var(--jira-danger-bg); color: var(--jira-danger); }

    .project-body { flex: 1; display: flex; flex-direction: column; gap: var(--spacing-xs); }
    .project-title { display: flex; align-items: center; gap: var(--spacing-sm); }
    .project-title h3 { margin: 0; font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); }
    .project-description { margin: 0; font-size: var(--font-size-sm); color: var(--jira-neutral-600); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .project-description.empty { color: var(--jira-neutral-400); font-style: italic; }

    .project-footer { display: flex; flex-direction: column; gap: var(--spacing-xs); padding-top: var(--spacing-md); border-top: 1px solid var(--jira-neutral-200); }
    .project-meta { display: flex; flex-wrap: wrap; gap: var(--spacing-md); }
    .meta-item { display: flex; align-items: center; gap: var(--spacing-xs); font-size: var(--font-size-xs); color: var(--jira-neutral-600); }
    .meta-item .no-lead { color: var(--jira-neutral-400); font-style: italic; }
    .project-date { font-size: var(--font-size-xs); color: var(--jira-neutral-500); }

    .current-badge { position: absolute; top: var(--spacing-sm); right: var(--spacing-sm); display: flex; align-items: center; gap: var(--spacing-xs); padding: var(--spacing-xs) var(--spacing-sm); background: var(--jira-warning-bg); color: var(--jira-warning); border-radius: var(--radius-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); }

    .empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--spacing-3xl); gap: var(--spacing-md); }
    .empty-state h3 { margin: 0; font-size: var(--font-size-lg); }
    .empty-state p { margin: 0; color: var(--jira-neutral-600); }
  `]
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  typeFilter = signal<'all' | 'software' | 'business'>('all');

  showProjectDialog = signal(false);
  selectedProject = signal<Project | null>(null);

  filteredProjects = computed(() => {
    let filtered = this.projects();

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query) ||
        project.key.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query))
      );
    }

    // Filter by type
    const type = this.typeFilter();
    if (type !== 'all') {
      filtered = filtered.filter(project => project.projectType === type);
    }

    return filtered;
  });

  constructor(
    private projectService: ProjectService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectService.getProjects(1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.projects.set(response.items);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load projects:', err);
          this.error.set('Failed to load projects. Please try again.');
          this.loading.set(false);
        }
      });
  }

  refreshProjects(): void {
    this.loadProjects();
  }

  createProject(): void {
    this.selectedProject.set(null);
    this.showProjectDialog.set(true);
  }

  editProject(project: Project): void {
    this.selectedProject.set(project);
    this.showProjectDialog.set(true);
  }

  onProjectSubmit(dto: CreateProjectDto | UpdateProjectDto): void {
    const isEdit = !!this.selectedProject();

    const operation = isEdit
      ? this.projectService.update(this.selectedProject()!.id, dto as UpdateProjectDto)
      : this.projectService.create(dto as CreateProjectDto);

    operation.pipe(takeUntil(this.destroy$)).subscribe({
      next: (project) => {
        this.toastService.success(
          `Project ${isEdit ? 'updated' : 'created'} successfully`,
          `${project.name} has been ${isEdit ? 'updated' : 'created'}`
        );
        this.closeDialog();
        this.loadProjects();
      },
      error: (err) => {
        console.error('Failed to save project:', err);
        this.toastService.error(`Failed to ${isEdit ? 'update' : 'create'} project`, 'Please try again');
      }
    });
  }

  deleteProject(project: Project): void {
    if (!confirm(`Are you sure you want to delete ${project.name}? This action cannot be undone and will delete all associated issues.`)) return;

    this.projectService.delete(project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Project deleted', `${project.name} has been deleted`);
          this.loadProjects();
        },
        error: (err) => {
          console.error('Failed to delete project:', err);
          this.toastService.error('Failed to delete project', 'Please try again');
        }
      });
  }

  setAsCurrentProject(project: Project): void {
    this.projectService.setCurrentProject(project);
    this.toastService.success('Current project updated', `${project.name} is now your active project`);
  }

  isCurrentProject(project: Project): boolean {
    return this.projectService.currentProject()?.id === project.id;
  }

  closeDialog(): void {
    this.showProjectDialog.set(false);
    this.selectedProject.set(null);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
