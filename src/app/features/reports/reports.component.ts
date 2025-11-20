import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-placeholder">
      <h1>Reports</h1>
      <p>Coming soon...</p>
    </div>
  `,
  styles: [`
    .page-placeholder {
      text-align: center;
      padding: var(--spacing-3xl);
      color: var(--jira-neutral-600);
    }
  `]
})
export class ReportsComponent {}
