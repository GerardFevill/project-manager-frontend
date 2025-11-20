import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'kanban',
        loadComponent: () => import('./features/kanban/kanban.component').then(m => m.KanbanComponent)
      },
      {
        path: 'backlog',
        loadComponent: () => import('./features/backlog/backlog.component').then(m => m.BacklogComponent)
      },
      {
        path: 'sprints',
        loadComponent: () => import('./features/sprints/sprints.component').then(m => m.SprintsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'issues/:id',
        loadComponent: () => import('./features/issue-detail/issue-detail.component').then(m => m.IssueDetailComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
