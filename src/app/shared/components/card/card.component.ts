import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'jira-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <div class="card-header" *ngIf="hasHeader">
        <ng-content select="[header]"></ng-content>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div class="card-footer" *ngIf="hasFooter">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .card {
      background: var(--jira-neutral-0);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: box-shadow var(--transition-fast);
    }

    .card-flat {
      border: 1px solid var(--jira-neutral-200);
    }

    .card-elevated {
      box-shadow: var(--shadow-sm);

      &:hover {
        box-shadow: var(--shadow-md);
      }
    }

    .card-hoverable {
      cursor: pointer;

      &:hover {
        box-shadow: var(--shadow-lg);
      }
    }

    .card-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--jira-neutral-200);
      font-weight: var(--font-weight-semibold);
    }

    .card-body {
      padding: var(--spacing-lg);
    }

    .card-footer {
      padding: var(--spacing-lg);
      border-top: 1px solid var(--jira-neutral-200);
      background: var(--jira-neutral-50);
    }

    .card-compact .card-body {
      padding: var(--spacing-md);
    }

    .card-compact .card-header,
    .card-compact .card-footer {
      padding: var(--spacing-md);
    }
  `]
})
export class CardComponent {
  @Input() variant: 'flat' | 'elevated' = 'elevated';
  @Input() hoverable = false;
  @Input() compact = false;
  @Input() hasHeader = false;
  @Input() hasFooter = false;

  get cardClasses(): string {
    const classes = ['card', `card-${this.variant}`];

    if (this.hoverable) {
      classes.push('card-hoverable');
    }

    if (this.compact) {
      classes.push('card-compact');
    }

    return classes.join(' ');
  }
}
