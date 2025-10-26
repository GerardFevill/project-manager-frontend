import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../core/services';
import { TaskStats } from '../../core/models';
import { TaskType } from '../../core/models/task-type.enum';

interface TypeStats {
  type: TaskType;
  count: number;
  percentage: number;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit {
  private taskService = inject(TaskService);

  stats = signal<TaskStats | null>(null);
  typeStats = signal<TypeStats[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadStats();
    this.loadTypeStats();
  }

  loadStats() {
    this.loading.set(true);
    this.taskService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.loading.set(false);
      }
    });
  }

  loadTypeStats() {
    // Charger toutes les tâches et calculer les stats par type
    this.taskService.findAll({ limit: 1000 }).subscribe({
      next: (response) => {
        const tasks = response.data;
        const total = tasks.length;

        const typeCounts: Record<string, number> = {
          task: 0,
          project: 0,
          epic: 0,
          milestone: 0
        };

        tasks.forEach(task => {
          typeCounts[task.type] = (typeCounts[task.type] || 0) + 1;
        });

        const typeStats: TypeStats[] = [
          {
            type: TaskType.PROJECT,
            count: typeCounts['project'],
            percentage: total > 0 ? (typeCounts['project'] / total) * 100 : 0,
            label: 'Projets',
            icon: 'folder',
            color: '#7b1fa2'
          },
          {
            type: TaskType.TASK,
            count: typeCounts['task'],
            percentage: total > 0 ? (typeCounts['task'] / total) * 100 : 0,
            label: 'Tâches',
            icon: 'check_circle',
            color: '#1976d2'
          },
          {
            type: TaskType.EPIC,
            count: typeCounts['epic'],
            percentage: total > 0 ? (typeCounts['epic'] / total) * 100 : 0,
            label: 'Epics',
            icon: 'workspaces',
            color: '#f57c00'
          },
          {
            type: TaskType.MILESTONE,
            count: typeCounts['milestone'],
            percentage: total > 0 ? (typeCounts['milestone'] / total) * 100 : 0,
            label: 'Jalons',
            icon: 'flag',
            color: '#388e3c'
          }
        ];

        this.typeStats.set(typeStats);
      },
      error: (err) => {
        console.error('Error loading type stats:', err);
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      active: 'Actives',
      completed: 'Terminées',
      blocked: 'Bloquées',
      recurring: 'Récurrentes',
      archived: 'Archivées'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      low: 'Faible',
      medium: 'Moyenne',
      high: 'Haute',
      urgent: 'Urgente'
    };
    return labels[priority] || priority;
  }
}
