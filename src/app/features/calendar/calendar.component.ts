import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../core/services';
import { Task } from '../../core/models';
import { TaskType } from '../../core/models/task-type.enum';

interface CalendarDay {
  date: Date;
  tasks: Task[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatCheckboxModule,
    RouterLink
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent implements OnInit {
  private taskService = inject(TaskService);

  currentDate = signal(new Date());
  calendarDays = signal<CalendarDay[]>([]);
  allTasks = signal<Task[]>([]);
  loading = signal(true);

  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Filtres par type
  showTasks = true;
  showProjects = true;
  showEpics = true;
  showMilestones = true;

  TaskType = TaskType;

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading.set(true);

    // Construire le filtre de types en fonction des checkboxes
    const types: TaskType[] = [];
    if (this.showTasks) types.push(TaskType.TASK);
    if (this.showProjects) types.push(TaskType.PROJECT);
    if (this.showEpics) types.push(TaskType.EPIC);
    if (this.showMilestones) types.push(TaskType.MILESTONE);

    this.taskService.findAll({
      limit: 100,
      types: types.length > 0 ? types : undefined
    }).subscribe({
      next: (response) => {
        // Handle both paginated and non-paginated responses
        if (response && 'data' in response) {
          this.allTasks.set(response.data || []);
        } else {
          this.allTasks.set((response as any) || []);
        }
        this.generateCalendar();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.allTasks.set([]);
        this.generateCalendar(); // Generate calendar even on error
        this.loading.set(false);
      }
    });
  }

  generateCalendar() {
    const currentDate = this.currentDate();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);

    // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
    let startDayOfWeek = firstDay.getDay();
    // Convertir pour que lundi = 0
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Jours du mois précédent
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        tasks: this.getTasksForDate(date),
        isToday: false,
        isCurrentMonth: false
      });
    }

    // Jours du mois actuel
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      days.push({
        date,
        tasks: this.getTasksForDate(date),
        isToday: dateOnly.getTime() === today.getTime(),
        isCurrentMonth: true
      });
    }

    // Jours du mois suivant pour compléter
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        tasks: this.getTasksForDate(date),
        isToday: false,
        isCurrentMonth: false
      });
    }

    this.calendarDays.set(days);
  }

  getTasksForDate(date: Date): Task[] {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    return this.allTasks().filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === dateOnly.getTime();
    });
  }

  previousMonth() {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1));
    this.generateCalendar();
  }

  nextMonth() {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1));
    this.generateCalendar();
  }

  goToToday() {
    this.currentDate.set(new Date());
    this.generateCalendar();
  }

  getMonthName(): string {
    return this.currentDate().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  onFilterChange() {
    this.loadTasks();
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'task': return '#1976d2';
      case 'project': return '#7b1fa2';
      case 'epic': return '#f57c00';
      case 'milestone': return '#388e3c';
      default: return '#666';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'task': return 'check_circle';
      case 'project': return 'folder';
      case 'epic': return 'workspaces';
      case 'milestone': return 'flag';
      default: return 'help';
    }
  }
}
