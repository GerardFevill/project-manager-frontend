import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Task, Sprint, SprintStatus } from '../../core/models';
import { TaskService, NotificationService, SprintService } from '../../core/services';
import { SprintDialogComponent } from '../../shared/components/sprint-dialog/sprint-dialog';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar';

@Component({
  selector: 'app-sprint-planning',
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
    MatDividerModule,
    UserAvatarComponent
  ],
  templateUrl: './sprint-planning.html',
  styleUrl: './sprint-planning.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SprintPlanning implements OnInit {
  loading = signal(false);

  // Sprint management
  sprints = signal<Sprint[]>([]);
  selectedSprint = signal<Sprint | null>(null);

  // Tasks
  backlogTasks = signal<Task[]>([]);
  sprintTasks = signal<Task[]>([]);

  // Stats
  totalEstimatedHours = signal(0);
  taskCount = signal(0);

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
        const allSprints = response.data || [];

        // Filter only planned sprints for planning
        const plannedSprints = allSprints.filter(s => s.status === SprintStatus.PLANNED);
        this.sprints.set(plannedSprints);

        // Auto-select first planned sprint
        if (plannedSprints.length > 0 && !this.selectedSprint()) {
          this.selectSprint(plannedSprints[0]);
        }
      },
      error: (err) => {
        console.error('Error loading sprints:', err);
        this.notificationService.error('Erreur lors du chargement des sprints');
      }
    });
  }

  selectSprint(sprint: Sprint) {
    this.selectedSprint.set(sprint);
    this.loadSprintTasks(sprint.id);
    this.loadBacklogTasks();
  }

  onSprintSelectChange(sprintId: number) {
    const sprint = this.sprints().find(s => s.id === sprintId);
    if (sprint) {
      this.selectSprint(sprint);
    }
  }

  loadBacklogTasks() {
    this.loading.set(true);

    this.taskService.findAll({ limit: 100 }).subscribe({
      next: (response) => {
        const tasks = response.data || [];
        const backlog = tasks.filter(t => t.sprintId === null);
        this.backlogTasks.set(backlog);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading backlog:', err);
        this.notificationService.error('Erreur lors du chargement du backlog');
        this.loading.set(false);
      }
    });
  }

  loadSprintTasks(sprintId: number) {
    this.loading.set(true);

    this.taskService.findAll({ limit: 100 }).subscribe({
      next: (response) => {
        const tasks = response.data || [];
        const sprintTasks = tasks.filter(t => t.sprintId === sprintId);
        this.sprintTasks.set(sprintTasks);

        // Calculate stats
        const totalHours = sprintTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
        this.totalEstimatedHours.set(totalHours);
        this.taskCount.set(sprintTasks.length);

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading sprint tasks:', err);
        this.notificationService.error('Erreur lors du chargement des tâches');
        this.loading.set(false);
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>, targetList: 'backlog' | 'sprint') {
    if (event.previousContainer === event.container) {
      // Same list, no action needed
      return;
    }

    const task = event.previousContainer.data[event.previousIndex];
    const sprintId = targetList === 'sprint' ? this.selectedSprint()?.id : null;

    if (sprintId === undefined) {
      this.notificationService.error('Aucun sprint sélectionné');
      return;
    }

    // Update task in backend
    this.taskService.update(task.id, { sprintId }).subscribe({
      next: () => {
        // Update UI
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );

        // Update stats
        if (targetList === 'sprint') {
          this.taskCount.set(this.taskCount() + 1);
          this.totalEstimatedHours.set(this.totalEstimatedHours() + (task.estimatedHours || 0));
          this.notificationService.success(`Tâche ajoutée au sprint`);
        } else {
          this.taskCount.set(this.taskCount() - 1);
          this.totalEstimatedHours.set(this.totalEstimatedHours() - (task.estimatedHours || 0));
          this.notificationService.success('Tâche retirée du sprint');
        }
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.notificationService.error('Erreur lors de la mise à jour');
      }
    });
  }

  startSprint() {
    const sprint = this.selectedSprint();
    if (!sprint) return;

    if (this.sprintTasks().length === 0) {
      this.notificationService.error('Le sprint doit contenir au moins une tâche');
      return;
    }

    this.sprintService.startSprint(sprint.id).subscribe({
      next: () => {
        this.notificationService.success(`Sprint "${sprint.name}" démarré`);
        this.router.navigate(['/kanban']);
      },
      error: (err) => {
        console.error('Error starting sprint:', err);
        this.notificationService.error('Erreur lors du démarrage du sprint');
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
            next: (newSprint) => {
              this.notificationService.success('Sprint créé');
              this.loadSprints();
              this.selectSprint(newSprint);
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

  openTaskDetail(taskId: number | string) {
    this.router.navigate(['/tasks', taskId]);
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
}
