import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  },
  {
    path: 'tasks',
    loadComponent: () => import('./features/tasks/task-list/task-list').then(m => m.TaskListComponent)
  },
  {
    path: 'tasks/:id',
    loadComponent: () => import('./features/tasks/task-detail/task-detail').then(m => m.TaskDetailComponent)
  },
  {
    path: 'projects',
    loadComponent: () => import('./features/projects/project-list').then(m => m.ProjectListComponent)
  },
  {
    path: 'stats',
    loadComponent: () => import('./features/stats/stats.component').then(m => m.StatsComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/analytics').then(m => m.AnalyticsComponent)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'kanban',
    loadComponent: () => import('./features/kanban/kanban').then(m => m.Kanban)
  },
  {
    path: 'sprint-planning',
    loadComponent: () => import('./features/sprint-planning/sprint-planning').then(m => m.SprintPlanning)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'help',
    loadComponent: () => import('./features/help/help.component').then(m => m.HelpComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports').then(m => m.ReportsComponent)
  }
];
