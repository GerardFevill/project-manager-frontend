import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { KanbanColumnComponent, KanbanColumn } from './kanban-column/kanban-column.component';
import { KanbanSwimlaneComponent, Swimlane } from './kanban-swimlane/kanban-swimlane.component';
import { IssueService, Issue, IssueStatus } from '../../core/services/issue.service';
import { SprintService, Sprint } from '../../core/services/sprint.service';

type GroupBy = 'none' | 'assignee' | 'priority';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, KanbanColumnComponent, KanbanSwimlaneComponent],
  template: `
    <div class="kanban-page">
      <!-- Header -->
      <div class="kanban-header">
        <div class="header-title">
          <h1>Board</h1>
          <div class="sprint-info" *ngIf="activeSprint()">
            <jira-icon name="issues" [size]="20" />
            <span class="sprint-name">{{ activeSprint()!.name }}</span>
            <span class="sprint-status">{{ activeSprint()!.status }}</span>
          </div>
        </div>

        <div class="header-actions">
          <div class="group-by-selector">
            <label>Group by:</label>
            <select
              [value]="groupBy()"
              (change)="onGroupByChange($event)"
              class="group-by-select"
            >
              <option value="none">None</option>
              <option value="assignee">Assignee</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          <jira-button
            variant="subtle"
            size="medium"
            (clicked)="refreshBoard()"
            [disabled]="loading()"
          >
            <jira-icon leftIcon name="arrow-up" [size]="16" />
            Refresh
          </jira-button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading-state">
        <div class="spinner"></div>
        <p>Loading board...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading() && error()" class="error-state">
        <jira-icon name="warning" [size]="48" color="var(--jira-danger)" />
        <p>{{ error() }}</p>
        <jira-button variant="primary" (clicked)="refreshBoard()">
          Retry
        </jira-button>
      </div>

      <!-- No Sprint State -->
      <div *ngIf="!loading() && !error() && !activeSprint()" class="empty-state">
        <jira-icon name="issues" [size]="64" color="var(--jira-neutral-400)" />
        <h2>No active sprint</h2>
        <p>Start a sprint to see your board</p>
      </div>

      <!-- Kanban Board - Standard View -->
      <div
        *ngIf="!loading() && !error() && activeSprint() && groupBy() === 'none'"
        class="kanban-board"
      >
        <app-kanban-column
          *ngFor="let column of columns(); trackBy: trackByColumnId"
          [column]="column"
          [connectedLists]="getConnectedLists()"
          (cardClick)="onCardClick($event)"
          (cardDrop)="onCardDrop($event)"
        />
      </div>

      <!-- Kanban Board - Swimlane View -->
      <div
        *ngIf="!loading() && !error() && activeSprint() && groupBy() !== 'none'"
        class="kanban-swimlanes"
      >
        <app-kanban-swimlane
          *ngFor="let swimlane of swimlanes(); trackBy: trackBySwimlaneId"
          [swimlane]="swimlane"
          [connectedLists]="getConnectedLists()"
          (cardClick)="onCardClick($event)"
          (cardDrop)="onCardDrop($event)"
        />
      </div>
    </div>
  `,
  styles: [`
    .kanban-page {
      padding: var(--spacing-xl);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .kanban-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-xl);
      gap: var(--spacing-xl);

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;

      h1 {
        margin: 0;
        color: var(--jira-neutral-1000);
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-semibold);
      }
    }

    .sprint-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--jira-info-bg);
      border: 1px solid var(--jira-info);
      border-radius: var(--radius-md);
    }

    .sprint-name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
    }

    .sprint-status {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-success);
      background: var(--jira-success-bg);
      padding: 2px var(--spacing-xs);
      border-radius: var(--radius-sm);
      text-transform: uppercase;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .group-by-selector {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--jira-neutral-700);
      }
    }

    .group-by-select {
      padding: var(--spacing-xs) var(--spacing-sm);
      border: 1px solid var(--jira-neutral-300);
      border-radius: var(--radius-sm);
      background: var(--jira-neutral-0);
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-1000);
      cursor: pointer;
      transition: border-color var(--transition-fast);

      &:hover {
        border-color: var(--jira-brand-primary);
      }

      &:focus {
        outline: none;
        border-color: var(--jira-brand-primary);
      }
    }

    .loading-state,
    .error-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;
      gap: var(--spacing-lg);
      flex: 1;

      p {
        color: var(--jira-neutral-600);
        font-size: var(--font-size-md);
        margin: 0;
      }

      h2 {
        font-size: var(--font-size-2xl);
        color: var(--jira-neutral-800);
        margin: 0;
      }
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--jira-neutral-200);
      border-top-color: var(--jira-brand-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .kanban-board {
      display: flex;
      gap: var(--spacing-lg);
      overflow-x: auto;
      flex: 1;
      padding-bottom: var(--spacing-lg);
    }

    .kanban-swimlanes {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      overflow: auto;
      flex: 1;
      padding-bottom: var(--spacing-lg);
    }
  `]
})
export class KanbanComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeSprint = signal<Sprint | null>(null);
  issues = signal<Issue[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  groupBy = signal<GroupBy>('none');

  // Column definitions
  columnDefinitions: Array<{ id: string; title: string; status: IssueStatus; color: string }> = [
    { id: 'todo', title: 'To Do', status: 'todo', color: '#DFE1E6' },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress', color: '#0052CC' },
    { id: 'review', title: 'In Review', status: 'review', color: '#FF991F' },
    { id: 'done', title: 'Done', status: 'done', color: '#00875A' }
  ];

  // Computed columns with issues
  columns = computed<KanbanColumn[]>(() => {
    const allIssues = this.issues();

    return this.columnDefinitions.map(def => ({
      id: def.id,
      title: def.title,
      status: def.status,
      color: def.color,
      issues: allIssues.filter(issue => issue.status === def.status)
    }));
  });

  // Computed swimlanes
  swimlanes = computed<Swimlane[]>(() => {
    const allIssues = this.issues();
    const groupByType = this.groupBy();

    if (groupByType === 'none') return [];

    const groupsMap = new Map<string, Issue[]>();

    // Group issues
    allIssues.forEach(issue => {
      let groupKey: string;
      let groupName: string;

      if (groupByType === 'assignee') {
        groupKey = issue.assignee?.id || 'unassigned';
        groupName = issue.assignee?.name || 'Unassigned';
      } else if (groupByType === 'priority') {
        groupKey = issue.priority;
        groupName = issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1);
      } else {
        return;
      }

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, []);
      }
      groupsMap.get(groupKey)!.push(issue);
    });

    // Convert to swimlanes
    return Array.from(groupsMap.entries()).map(([key, groupIssues]) => {
      const firstIssue = groupIssues[0];
      const name = groupByType === 'assignee'
        ? (firstIssue.assignee?.name || 'Unassigned')
        : firstIssue.priority.charAt(0).toUpperCase() + firstIssue.priority.slice(1);

      return {
        id: key,
        name,
        avatar: groupByType === 'assignee' ? firstIssue.assignee?.avatar : undefined,
        color: groupByType === 'priority' ? this.getPriorityColor(firstIssue.priority) : undefined,
        columns: this.columnDefinitions.map(def => ({
          id: `${key}-${def.id}`,
          title: def.title,
          status: def.status,
          color: def.color,
          issues: groupIssues.filter(issue => issue.status === def.status)
        }))
      };
    });
  });

  constructor(
    private issueService: IssueService,
    private sprintService: SprintService
  ) {}

  ngOnInit(): void {
    this.loadBoard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBoard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.sprintService.getActiveSprint()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sprint) => {
          this.activeSprint.set(sprint);

          if (sprint) {
            this.loadSprintIssues(sprint.id);
          } else {
            this.loading.set(false);
          }
        },
        error: (err) => {
          console.error('Error loading active sprint:', err);
          this.error.set('Failed to load active sprint. Please try again.');
          this.loading.set(false);
        }
      });
  }

  loadSprintIssues(sprintId: string): void {
    this.issueService.getIssues({ sprint: sprintId }, 1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.issues.set(response.items);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading sprint issues:', err);
          this.error.set('Failed to load sprint issues. Please try again.');
          this.loading.set(false);
        }
      });
  }

  refreshBoard(): void {
    this.loadBoard();
  }

  onCardClick(issue: Issue): void {
    console.log('Card clicked:', issue);
    // TODO: Open issue detail dialog
  }

  getConnectedLists(): string[] {
    return this.columnDefinitions.map(def => def.id);
  }

  onCardDrop(event: CdkDragDrop<Issue[]>): void {
    const issue = event.previousContainer.data[event.previousIndex];

    if (event.previousContainer === event.container) {
      // Reordering within same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between columns
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Determine new status based on target column
      const targetColumnId = event.container.id;
      const targetColumn = this.columnDefinitions.find(def => def.id === targetColumnId);

      if (issue && targetColumn) {
        this.updateIssueStatus(issue.id, targetColumn.status);
      }
    }
  }

  updateIssueStatus(issueId: string, newStatus: IssueStatus): void {
    this.issueService.updateIssue(issueId, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedIssue) => {
          console.log('Issue status updated:', updatedIssue);
          // Update local state
          this.issues.update(issues =>
            issues.map(issue => issue.id === issueId ? updatedIssue : issue)
          );
        },
        error: (err) => {
          console.error('Error updating issue status:', err);
          // Reload to restore correct state
          if (this.activeSprint()) {
            this.loadSprintIssues(this.activeSprint()!.id);
          }
        }
      });
  }

  onGroupByChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.groupBy.set(select.value as GroupBy);
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      highest: '#FF5630',
      high: '#FF991F',
      medium: '#0052CC',
      low: '#00875A',
      lowest: '#DFE1E6'
    };
    return colors[priority] || '#DFE1E6';
  }

  trackByColumnId(index: number, column: KanbanColumn): string {
    return column.id;
  }

  trackBySwimlaneId(index: number, swimlane: Swimlane): string {
    return swimlane.id;
  }
}
