import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Task, TaskStatus, Sprint, SprintStatus } from '../../core/models';
import { TaskService, NotificationService, SprintService } from '../../core/services';
import { CreateTaskDialogComponent } from '../../shared/components/create-task-dialog/create-task-dialog';
import { SprintDialogComponent } from '../../shared/components/sprint-dialog/sprint-dialog';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar';

interface KanbanColumn {
  id: TaskStatus;
  title: string;
  icon: string;
  color: string;
  tasks: Task[];
}

type ViewMode = 'sprint' | 'backlog' | 'all';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    MatMenuModule,
    MatDividerModule,
    UserAvatarComponent
  ],
  templateUrl: './kanban.html',
  styleUrl: './kanban.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Kanban implements OnInit {
  loading = signal(false);
  viewMode = signal<ViewMode>('sprint');

  // Sprint management
  sprints = signal<Sprint[]>([]);
  activeSprint = signal<Sprint | null>(null);
  selectedSprintId = signal<number | null>(null);
  backlogTasks = signal<Task[]>([]);

  columns = signal<KanbanColumn[]>([
    { id: TaskStatus.DRAFT, title: 'Draft', icon: 'edit_note', color: '#6c757d', tasks: [] },
    { id: TaskStatus.ACTIVE, title: 'Active', icon: 'hourglass_empty', color: '#0969da', tasks: [] },
    { id: TaskStatus.BLOCKED, title: 'Blocked', icon: 'block', color: '#cf222e', tasks: [] },
    { id: TaskStatus.RECURRING, title: 'Recurring', icon: 'repeat', color: '#8250df', tasks: [] },
    { id: TaskStatus.COMPLETED, title: 'Completed', icon: 'check_circle', color: '#2da44e', tasks: [] },
    { id: TaskStatus.ARCHIVED, title: 'Archived', icon: 'archive', color: '#6c757d', tasks: [] }
  ]);

  constructor(
    private taskService: TaskService,
    private sprintService: SprintService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    public router: Router
  ) {}

  ngOnInit() {
    this.loadSprints();
  }

  loadSprints() {
    this.sprintService.findAll({ limit: 50 }).subscribe({
      next: (response) => {
        this.sprints.set(response.data || []);

        // Find active sprint
        const active = this.sprints().find(s => s.status === SprintStatus.ACTIVE);
        this.activeSprint.set(active || null);

        if (active) {
          this.selectedSprintId.set(active.id);
          this.loadSprintTasks(active.id);
        } else {
          this.loadBacklogTasks();
        }
      },
      error: (err) => {
        console.error('Error loading sprints:', err);
        this.loadBacklogTasks();
      }
    });
  }

  loadSprintTasks(sprintId: number) {
    this.loading.set(true);
    this.viewMode.set('sprint');

    this.taskService.findAll({ limit: 100 }).subscribe({
      next: (response) => {
        const tasks = response.data || [];
        const sprintTasks = tasks.filter(t => t.sprintId === sprintId);

        const updatedColumns = this.columns().map(column => ({
          ...column,
          tasks: sprintTasks.filter(task => task.status === column.id)
        }));

        this.columns.set(updatedColumns);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading sprint tasks:', err);
        this.loading.set(false);
      }
    });
  }

  loadBacklogTasks() {
    this.loading.set(true);
    this.viewMode.set('backlog');

    this.taskService.findAll({ limit: 100 }).subscribe({
      next: (response) => {
        const tasks = response.data || [];
        const backlog = tasks.filter(t => t.sprintId === null);
        this.backlogTasks.set(backlog);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading backlog:', err);
        this.loading.set(false);
      }
    });
  }

  loadAllTasks() {
    this.loading.set(true);
    this.viewMode.set('all');
    this.selectedSprintId.set(null);

    this.taskService.findAll({ limit: 100 }).subscribe({
      next: (response) => {
        const tasks = response.data || [];

        const updatedColumns = this.columns().map(column => ({
          ...column,
          tasks: tasks.filter(task => task.status === column.id)
        }));

        this.columns.set(updatedColumns);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.loading.set(false);
      }
    });
  }

  onSprintChange(sprintId: number | 'backlog' | 'all') {
    if (sprintId === 'backlog') {
      this.loadBacklogTasks();
    } else if (sprintId === 'all') {
      this.loadAllTasks();
    } else {
      this.selectedSprintId.set(sprintId);
      this.loadSprintTasks(sprintId);
    }
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];

      this.taskService.update(task.id, { status: newStatus }).subscribe({
        next: () => {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
          this.notificationService.success('Tâche déplacée');
        },
        error: (err) => {
          console.error('Error updating task status:', err);
          this.notificationService.error('Erreur lors du déplacement');
        }
      });
    }
  }

  dropToBacklog(event: CdkDragDrop<Task[]>) {
    const task = event.previousContainer.data[event.previousIndex];

    this.taskService.update(task.id, { sprintId: null }).subscribe({
      next: () => {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.notificationService.success('Tâche déplacée vers le backlog');
      },
      error: (err) => {
        console.error('Error moving task to backlog:', err);
        this.notificationService.error('Erreur');
      }
    });
  }

  assignTaskToSprint(taskId: number | string, sprintId: number) {
    this.taskService.update(String(taskId), { sprintId }).subscribe({
      next: () => {
        this.notificationService.success('Tâche assignée au sprint');
        if (this.selectedSprintId() === sprintId) {
          this.loadSprintTasks(sprintId);
        }
        this.loadBacklogTasks();
      },
      error: (err) => {
        console.error('Error assigning task:', err);
        this.notificationService.error('Erreur');
      }
    });
  }

  openTaskDetail(taskId: number | string) {
    this.router.navigate(['/tasks', taskId]);
  }

  openCreateDialog(status: TaskStatus) {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      width: '800px',
      data: { status, sprintId: this.selectedSprintId() } as any
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.create(result).subscribe({
          next: () => {
            this.notificationService.success('Tâche créée');
            if (this.viewMode() === 'sprint' && this.selectedSprintId()) {
              this.loadSprintTasks(this.selectedSprintId()!);
            } else if (this.viewMode() === 'backlog') {
              this.loadBacklogTasks();
            } else {
              this.loadAllTasks();
            }
          },
          error: (err) => {
            console.error('Error creating task:', err);
            this.notificationService.error('Erreur lors de la création');
          }
        });
      }
    });
  }

  openSprintDialog(sprint?: Sprint) {
    const dialogRef = this.dialog.open(SprintDialogComponent, {
      width: '600px',
      data: sprint
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (sprint) {
          this.sprintService.update(sprint.id, result).subscribe({
            next: () => {
              this.notificationService.success('Sprint mis à jour');
              this.loadSprints();
            },
            error: (err) => {
              console.error('Error updating sprint:', err);
              this.notificationService.error('Erreur');
            }
          });
        } else {
          this.sprintService.create(result).subscribe({
            next: () => {
              this.notificationService.success('Sprint créé');
              this.loadSprints();
            },
            error: (err) => {
              console.error('Error creating sprint:', err);
              this.notificationService.error('Erreur');
            }
          });
        }
      }
    });
  }

  startSprint(sprint: Sprint) {
    this.sprintService.startSprint(sprint.id).subscribe({
      next: () => {
        this.notificationService.success(`Sprint "${sprint.name}" démarré`);
        this.loadSprints();
      },
      error: (err) => {
        console.error('Error starting sprint:', err);
        this.notificationService.error('Erreur');
      }
    });
  }

  completeSprint(sprint: Sprint) {
    this.sprintService.completeSprint(sprint.id).subscribe({
      next: () => {
        this.notificationService.success(`Sprint "${sprint.name}" terminé`);
        this.loadSprints();
      },
      error: (err) => {
        console.error('Error completing sprint:', err);
        this.notificationService.error('Erreur');
      }
    });
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'low': return '#1976d2';
      case 'medium': return '#f57c00';
      case 'high': return '#d32f2f';
      case 'urgent': return '#7b1fa2';
      default: return '#757575';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'low': return 'arrow_downward';
      case 'medium': return 'remove';
      case 'high': return 'arrow_upward';
      case 'urgent': return 'priority_high';
      default: return 'help';
    }
  }

  getTypeIcon(issueType: string): string {
    switch (issueType) {
      case 'epic': return 'bolt';
      case 'story': return 'bookmark';
      case 'task': return 'check_box';
      case 'bug': return 'bug_report';
      case 'subtask': return 'subdirectory_arrow_right';
      default: return 'check_box';
    }
  }

  getTypeColor(issueType: string): string {
    switch (issueType) {
      case 'epic': return '#6554C0';
      case 'story': return '#00875A';
      case 'task': return '#0052CC';
      case 'bug': return '#DE350B';
      case 'subtask': return '#5E6C84';
      default: return '#0052CC';
    }
  }

  getConnectedLists(): string[] {
    return this.columns().map(col => col.id);
  }

  getSprintStatusColor(status: SprintStatus): string {
    switch (status) {
      case SprintStatus.PLANNED: return '#6c757d';
      case SprintStatus.ACTIVE: return '#0969da';
      case SprintStatus.COMPLETED: return '#2da44e';
      default: return '#757575';
    }
  }
}
