import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { KanbanColumnComponent, KanbanColumn } from '../kanban-column/kanban-column.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { Issue, IssueStatus } from '../../../core/services/issue.service';

export interface Swimlane {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  columns: KanbanColumn[];
}

@Component({
  selector: 'app-kanban-swimlane',
  standalone: true,
  imports: [CommonModule, KanbanColumnComponent, AvatarComponent, IconComponent],
  template: `
    <div class="swimlane">
      <div class="swimlane-header">
        <div class="swimlane-info">
          <jira-avatar
            *ngIf="swimlane.avatar"
            [name]="swimlane.name"
            [src]="swimlane.avatar"
            size="small"
          />
          <jira-icon
            *ngIf="!swimlane.avatar && swimlane.color"
            name="issues"
            [size]="20"
            [color]="swimlane.color"
          />
          <h3>{{ swimlane.name }}</h3>
          <span class="issue-count">{{ getTotalIssues() }}</span>
        </div>
      </div>

      <div class="swimlane-content">
        <app-kanban-column
          *ngFor="let column of swimlane.columns; trackBy: trackByColumnId"
          [column]="column"
          [connectedLists]="connectedLists"
          (cardClick)="onCardClick($event)"
          (cardDrop)="onCardDrop($event)"
        />
      </div>
    </div>
  `,
  styles: [`
    .swimlane {
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid var(--jira-neutral-200);
      margin-bottom: var(--spacing-md);
    }

    .swimlane-header {
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--jira-neutral-100);
      border-bottom: 1px solid var(--jira-neutral-200);
    }

    .swimlane-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      h3 {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--jira-neutral-1000);
        margin: 0;
      }
    }

    .issue-count {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-600);
      background: var(--jira-neutral-200);
      padding: 2px var(--spacing-xs);
      border-radius: var(--radius-sm);
      min-width: 24px;
      text-align: center;
    }

    .swimlane-content {
      display: flex;
      gap: var(--spacing-lg);
      padding: var(--spacing-md);
      overflow-x: auto;
    }
  `]
})
export class KanbanSwimlaneComponent {
  @Input() swimlane!: Swimlane;
  @Input() connectedLists: string[] = [];
  @Output() cardClick = new EventEmitter<Issue>();
  @Output() cardDrop = new EventEmitter<CdkDragDrop<Issue[]>>();

  getTotalIssues(): number {
    return this.swimlane.columns.reduce((sum, col) => sum + col.issues.length, 0);
  }

  onCardClick(issue: Issue): void {
    this.cardClick.emit(issue);
  }

  onCardDrop(event: CdkDragDrop<Issue[]>): void {
    this.cardDrop.emit(event);
  }

  trackByColumnId(index: number, column: KanbanColumn): string {
    return column.id;
  }
}
