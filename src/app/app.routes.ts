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
        path: 'epics',
        loadComponent: () => import('./features/epics/epics.component').then(m => m.EpicsComponent)
      },
      {
        path: 'epics/:id',
        loadComponent: () => import('./features/epics/epic-detail/epic-detail.component').then(m => m.EpicDetailComponent)
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
        path: 'users',
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/projects.component').then(m => m.ProjectsComponent)
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
