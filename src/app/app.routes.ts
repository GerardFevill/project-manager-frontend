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
  }
];
