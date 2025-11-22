import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { KanbanCardComponent } from '../kanban-card/kanban-card.component';
import { Issue, IssueStatus } from '../../../core/services/issue.service';

export interface KanbanColumn {
  id: string;
  title: string;
  status: IssueStatus;
  issues: Issue[];
  color: string;
}

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [CommonModule, KanbanCardComponent, DragDropModule],
  template: `
    <div class="kanban-column">
      <div class="column-header" [style.border-left-color]="column.color">
        <div class="column-title">
          <h3>{{ column.title }}</h3>
          <span class="issue-count">{{ column.issues.length }}</span>
        </div>
      </div>

      <div
        class="column-content"
        cdkDropList
        [cdkDropListData]="column.issues"
        [id]="column.id"
        [cdkDropListConnectedTo]="connectedLists"
        (cdkDropListDropped)="onDrop($event)"
      >
        <div class="cards-list">
          <app-kanban-card
            *ngFor="let issue of column.issues; trackBy: trackByIssueId"
            [issue]="issue"
            (cardClick)="onCardClick($event)"
            cdkDrag
          />
        </div>

        <div *ngIf="column.issues.length === 0" class="empty-column">
          <p>No issues</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kanban-column {
      display: flex;
      flex-direction: column;
      background: var(--jira-neutral-50);
      border-radius: var(--radius-md);
      overflow: hidden;
      min-width: 300px;
      max-width: 350px;
      flex: 1;
    }

    .column-header {
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--jira-neutral-100);
      border-left: 4px solid transparent;
      transition: border-color var(--transition-fast);
    }

    .column-title {
      display: flex;
      align-items: center;
      justify-content: space-between;

      h3 {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--jira-neutral-1000);
        margin: 0;
      }
    }

    .issue-count {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-600);
      background: var(--jira-neutral-200);
      padding: 2px var(--spacing-xs);
      border-radius: var(--radius-sm);
      min-width: 24px;
      text-align: center;
    }

    .column-content {
      flex: 1;
      padding: var(--spacing-md);
      overflow-y: auto;
      min-height: 200px;
    }

    .cards-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .empty-column {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 150px;
      color: var(--jira-neutral-500);
      font-size: var(--font-size-sm);
      text-align: center;

      p {
        margin: 0;
      }
    }
  `]
})
export class KanbanColumnComponent {
  @Input() column!: KanbanColumn;
  @Input() connectedLists: string[] = [];
  @Output() cardClick = new EventEmitter<Issue>();
  @Output() cardDrop = new EventEmitter<CdkDragDrop<Issue[]>>();

  onCardClick(issue: Issue): void {
    this.cardClick.emit(issue);
  }

  onDrop(event: CdkDragDrop<Issue[]>): void {
    this.cardDrop.emit(event);
  }

  trackByIssueId(index: number, issue: Issue): string {
    return issue.id;
  }
}
