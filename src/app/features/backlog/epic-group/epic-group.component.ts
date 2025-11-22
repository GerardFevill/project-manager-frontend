import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { IssueListItemComponent } from '../issue-list-item/issue-list-item.component';
import { Issue } from '../../../core/services/issue.service';

export interface EpicGroup {
  epicId: string | null;
  epicKey?: string;
  epicName: string;
  epicColor?: string;
  issues: Issue[];
  totalPoints: number;
  completedPoints: number;
}

@Component({
  selector: 'app-epic-group',
  standalone: true,
  imports: [CommonModule, DragDropModule, IconComponent, IssueListItemComponent],
  template: `
    <div class="epic-group">
      <!-- Epic Header -->
      <div class="epic-header" (click)="toggleCollapse()">
        <div class="epic-header-left">
          <button class="collapse-btn">
            <jira-icon
              [name]="isCollapsed() ? 'menu' : 'arrow-down'"
              [size]="16"
            />
          </button>

          <div class="epic-icon" [style.background-color]="group.epicColor || '#6554C0'">
            <jira-icon name="issues" [size]="16" />
          </div>

          <div class="epic-info">
            <span class="epic-key" *ngIf="group.epicKey">{{ group.epicKey }}</span>
            <span class="epic-name">{{ group.epicName }}</span>
          </div>
        </div>

        <div class="epic-header-right">
          <div class="epic-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                [style.width.%]="progressPercent()"
              ></div>
            </div>
            <span class="progress-text">
              {{ group.completedPoints }} / {{ group.totalPoints }} points
            </span>
          </div>

          <span class="issue-count">
            {{ group.issues.length }} issues
          </span>
        </div>
      </div>

      <!-- Issues List -->
      <div class="epic-content" *ngIf="!isCollapsed()">
        <div
          class="issues-list"
          cdkDropList
          [cdkDropListData]="group.issues"
          [id]="getListId()"
          [cdkDropListConnectedTo]="connectedLists"
          (cdkDropListDropped)="onDrop($event)"
        >
          <app-issue-list-item
            *ngFor="let issue of group.issues; trackBy: trackByIssueId"
            [issue]="issue"
            [selectable]="selectable"
            [selected]="selectedIssues.has(issue.id)"
            (itemClick)="onIssueClick($event)"
            (editClick)="onIssueEdit($event)"
            (selectChange)="onIssueSelect(issue, $event)"
            cdkDrag
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .epic-group {
      margin-bottom: var(--spacing-lg);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-md);
      background: var(--jira-neutral-0);
      overflow: hidden;
    }

    .epic-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--jira-neutral-50);
      border-bottom: 1px solid var(--jira-neutral-200);
      cursor: pointer;
      user-select: none;
      transition: background var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-100);
      }
    }

    .epic-header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex: 1;
      min-width: 0;
    }

    .collapse-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-700);
      cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;

      &:hover {
        background: var(--jira-neutral-200);
        color: var(--jira-neutral-1000);
      }
    }

    .epic-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      color: white;
      flex-shrink: 0;
    }

    .epic-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .epic-key {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-600);
    }

    .epic-name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .epic-header-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      flex-shrink: 0;
    }

    .epic-progress {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .progress-bar {
      width: 100px;
      height: 8px;
      background: var(--jira-neutral-200);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--jira-brand-primary), #4C9AFF);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: var(--font-size-xs);
      color: var(--jira-neutral-700);
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
    }

    .issue-count {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
      background: var(--jira-neutral-100);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
      font-weight: var(--font-weight-medium);
    }

    .epic-content {
      padding: var(--spacing-md);
    }

    .issues-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    @media (max-width: 768px) {
      .epic-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
      }

      .epic-header-right {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
      }

      .epic-progress {
        width: 100%;
      }

      .progress-bar {
        flex: 1;
      }
    }
  `]
})
export class EpicGroupComponent {
  @Input() group!: EpicGroup;
  @Input() selectable = false;
  @Input() selectedIssues = new Set<string>();
  @Input() connectedLists: string[] = [];

  @Output() issueClick = new EventEmitter<Issue>();
  @Output() issueEdit = new EventEmitter<Issue>();
  @Output() issueSelect = new EventEmitter<{ issue: Issue; selected: boolean }>();
  @Output() issueDrop = new EventEmitter<CdkDragDrop<Issue[]>>();

  isCollapsed = signal(false);

  toggleCollapse(): void {
    this.isCollapsed.set(!this.isCollapsed());
  }

  progressPercent(): number {
    if (this.group.totalPoints === 0) return 0;
    return Math.round((this.group.completedPoints / this.group.totalPoints) * 100);
  }

  onIssueClick(issue: Issue): void {
    this.issueClick.emit(issue);
  }

  onIssueEdit(issue: Issue): void {
    this.issueEdit.emit(issue);
  }

  onIssueSelect(issue: Issue, selected: boolean): void {
    this.issueSelect.emit({ issue, selected });
  }

  trackByIssueId(index: number, issue: Issue): string {
    return issue.id;
  }

  getListId(): string {
    return `epic-list-${this.group.epicId || 'no-epic'}`;
  }

  onDrop(event: CdkDragDrop<Issue[]>): void {
    this.issueDrop.emit(event);
  }
}
