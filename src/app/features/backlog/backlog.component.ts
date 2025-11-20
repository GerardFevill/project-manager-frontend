import { Component, OnInit, signal, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { IssueListItemComponent } from './issue-list-item/issue-list-item.component';
import { EpicGroupComponent, EpicGroup } from './epic-group/epic-group.component';
import { IssueFormDialogComponent } from '../../shared/components/issue-form/issue-form-dialog.component';
import { IssueService, Issue, Sprint as IssueSprint, CreateIssueDto } from '../../core/services/issue.service';
import { SprintService, Sprint } from '../../core/services/sprint.service';
import { UserService, User } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-backlog',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    IssueListItemComponent,
    EpicGroupComponent,
    IssueFormDialogComponent,
    DragDropModule
  ],
  template: `
    <div class="backlog-page">
      <!-- Header -->
      <div class="backlog-header">
        <div class="header-title">
          <h1>Backlog</h1>
          <span class="issue-count" *ngIf="!loading()">
            {{ filteredIssues().length }} / {{ issues().length }} issues
          </span>
        </div>

        <div class="header-actions">
          <jira-button
            variant="subtle"
            size="medium"
            (clicked)="refreshIssues()"
            [disabled]="loading()"
          >
            <jira-icon leftIcon name="arrow-up" [size]="16" />
            Refresh
          </jira-button>

          <jira-button
            variant="primary"
            size="medium"
            (clicked)="createIssue()"
          >
            <jira-icon leftIcon name="plus" [size]="16" />
            Create Issue
          </jira-button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="search-filters" *ngIf="!loading() && !error()">
        <div class="search-bar">
          <jira-icon name="search" [size]="16" />
          <input
            type="text"
            placeholder="Search issues..."
            [value]="searchQuery()"
            (input)="onSearchChange($event)"
          />
        </div>

        <div class="filter-actions">
          <jira-button
            variant="subtle"
            size="medium"
            (clicked)="toggleFilters()"
          >
            <jira-icon leftIcon name="filter" [size]="16" />
            Filters
          </jira-button>

          <div class="bulk-actions" *ngIf="selectedIssueIds().size > 0">
            <span class="selection-count">{{ selectedIssueIds().size }} selected</span>

            <jira-button
              variant="subtle"
              size="small"
              (clicked)="moveSelectedToSprint()"
              [disabled]="!activeSprint()"
            >
              <jira-icon leftIcon name="arrow-up" [size]="14" />
              Add to Sprint
            </jira-button>

            <jira-button
              variant="subtle"
              size="small"
              (clicked)="clearSelection()"
            >
              Clear
            </jira-button>
          </div>
        </div>
      </div>

      <!-- Sprint Section -->
      <div class="active-sprint-section" *ngIf="activeSprint()">
        <div class="sprint-header">
          <div class="sprint-info">
            <jira-icon name="issues" [size]="20" />
            <h2>{{ activeSprint()!.name }}</h2>
            <span class="sprint-status">{{ activeSprint()!.status }}</span>
          </div>
          <span
            class="sprint-capacity"
            [class.over-capacity]="isOverCapacity()"
          >
            {{ sprintPoints() }} / {{ activeSprint()!.capacity || 40 }} points
          </span>
        </div>

        <div
          class="sprint-issues"
          cdkDropList
          [cdkDropListData]="sprintIssues()"
          [id]="'sprint-list'"
          [cdkDropListConnectedTo]="getEpicListIds()"
          (cdkDropListDropped)="onDrop($event)"
        >
          <app-issue-list-item
            *ngFor="let issue of sprintIssues(); trackBy: trackByIssueId"
            [issue]="issue"
            (itemClick)="onIssueClick($event)"
            (editClick)="onIssueEdit($event)"
            cdkDrag
          />

          <div *ngIf="sprintIssues().length === 0" class="sprint-drop-zone">
            <jira-icon name="arrow-down" [size]="24" color="var(--jira-neutral-400)" />
            <span>Drag issues here to add to sprint</span>
          </div>
        </div>
      </div>

      <!-- Issues List -->
      <div class="backlog-content">
        <div *ngIf="loading()" class="loading-state">
          <div class="spinner"></div>
          <p>Loading backlog...</p>
        </div>

        <div *ngIf="!loading() && error()" class="error-state">
          <jira-icon name="warning" [size]="48" color="var(--jira-danger)" />
          <p>{{ error() }}</p>
          <jira-button variant="primary" (clicked)="refreshIssues()">
            Retry
          </jira-button>
        </div>

        <div *ngIf="!loading() && !error()" class="issues-container">
          <!-- Epic Groups -->
          <div class="epic-groups">
            <app-epic-group
              *ngFor="let group of epicGroups(); trackBy: trackByEpicId"
              [group]="group"
              [selectable]="true"
              [selectedIssues]="selectedIssueIds()"
              [connectedLists]="['sprint-list'].concat(getEpicListIds())"
              (issueClick)="onIssueClick($event)"
              (issueEdit)="onIssueEdit($event)"
              (issueSelect)="onIssueSelect($event)"
              (issueDrop)="onDrop($event)"
            />
          </div>

          <div *ngIf="issues().length === 0" class="empty-state">
            <jira-icon name="issues" [size]="64" color="var(--jira-neutral-400)" />
            <h2>No issues in backlog</h2>
            <p>Create your first issue to get started</p>
            <jira-button variant="primary" size="large" (clicked)="createIssue()">
              <jira-icon leftIcon name="plus" [size]="16" />
              Create Issue
            </jira-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Issue Form Dialog -->
    <app-issue-form-dialog
      *ngIf="showIssueDialog()"
      [availableUsers]="availableUsers"
      [availableSprints]="availableSprints"
      (submit)="onIssueSubmit($event)"
      (cancel)="showIssueDialog.set(false)"
    />
  `,
  styles: [`
    .backlog-page {
      padding: var(--spacing-xl);
      max-width: 1400px;
      margin: 0 auto;
    }

    .backlog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-2xl);
      gap: var(--spacing-xl);

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .header-title {
      display: flex;
      align-items: baseline;
      gap: var(--spacing-md);
    }

    h1 {
      margin: 0;
      color: var(--jira-neutral-1000);
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-semibold);
    }

    .issue-count {
      font-size: var(--font-size-md);
      color: var(--jira-neutral-600);
      background: var(--jira-neutral-100);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    }

    .search-filters {
      display: flex;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
      align-items: center;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .search-bar {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--jira-neutral-0);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-md);
      transition: border-color var(--transition-fast);

      &:focus-within {
        border-color: var(--jira-brand-primary);
      }

      input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-size: var(--font-size-md);
        color: var(--jira-neutral-1000);

        &::placeholder {
          color: var(--jira-neutral-500);
        }
      }
    }

    .filter-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .bulk-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--jira-info-bg);
      border: 1px solid var(--jira-info);
      border-radius: var(--radius-md);
    }

    .selection-count {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-info);
    }

    .active-sprint-section {
      background: var(--jira-info-bg);
      border: 2px solid var(--jira-info);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .sprint-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-md);
    }

    .sprint-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      h2 {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--jira-neutral-1000);
        margin: 0;
      }
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

    .sprint-capacity {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-700);
      font-weight: var(--font-weight-semibold);

      &.over-capacity {
        color: var(--jira-danger);
      }
    }

    .sprint-issues {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      min-height: 60px;
    }

    .sprint-drop-zone {
      min-height: 60px;
      border: 2px dashed var(--jira-neutral-300);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      color: var(--jira-neutral-600);
      font-size: var(--font-size-sm);
      background: var(--jira-neutral-0);
    }

    .backlog-content {
      min-height: 400px;
    }

    .loading-state,
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;
      gap: var(--spacing-lg);

      p {
        color: var(--jira-neutral-600);
        font-size: var(--font-size-md);
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

    .issues-container {
      display: flex;
      flex-direction: column;
    }

    .issues-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;
      gap: var(--spacing-md);

      h2 {
        font-size: var(--font-size-2xl);
        color: var(--jira-neutral-800);
        margin: 0;
      }

      p {
        color: var(--jira-neutral-600);
        font-size: var(--font-size-md);
        margin: 0;
      }
    }
  `]
})
export class BacklogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  issues = signal<Issue[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Sprint state
  activeSprint = signal<Sprint | null>(null);
  sprintIssues = signal<Issue[]>([]);

  // Filters and selection
  searchQuery = signal<string>('');
  selectedIssueIds = signal<Set<string>>(new Set());
  showFilters = signal(false);

  // Issue form dialog
  showIssueDialog = signal(false);
  availableUsers = signal<User[]>([]);
  availableSprints = signal<Sprint[]>([]);

  // Computed sprint points
  sprintPoints = computed(() => {
    return this.sprintIssues().reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
  });

  // Computed filtered issues
  filteredIssues = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.issues();

    return this.issues().filter(issue =>
      issue.key.toLowerCase().includes(query) ||
      issue.summary.toLowerCase().includes(query) ||
      issue.description?.toLowerCase().includes(query)
    );
  });

  // Computed signal to group issues by epic
  epicGroups = computed(() => {
    const allIssues = this.filteredIssues();
    const groups: Map<string, EpicGroup> = new Map();

    // Separate epics from other issues
    const epics = allIssues.filter(i => i.type === 'epic');
    const otherIssues = allIssues.filter(i => i.type !== 'epic');

    // Create groups for each epic
    epics.forEach(epic => {
      groups.set(epic.id, {
        epicId: epic.id,
        epicKey: epic.key,
        epicName: epic.summary,
        epicColor: this.getEpicColor(epic.id),
        issues: [],
        totalPoints: 0,
        completedPoints: 0
      });
    });

    // Create "No Epic" group for other issues
    if (otherIssues.length > 0) {
      const group: EpicGroup = {
        epicId: null,
        epicName: 'Backlog (Sans Epic)',
        epicColor: '#6554C0',
        issues: otherIssues,
        totalPoints: 0,
        completedPoints: 0
      };

      otherIssues.forEach(issue => {
        const points = issue.storyPoints || 0;
        group.totalPoints += points;
        if (issue.status === 'done') {
          group.completedPoints += points;
        }
      });

      groups.set('no-epic', group);
    }

    // Convert map to array and sort: "No Epic" last
    return Array.from(groups.values()).sort((a, b) => {
      if (a.epicId === null) return 1;
      if (b.epicId === null) return -1;
      return a.epicName.localeCompare(b.epicName);
    });
  });

  constructor(
    private issueService: IssueService,
    private sprintService: SprintService,
    private userService: UserService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadIssues();
    this.loadActiveSprint();
    this.loadAvailableData();
  }

  loadAvailableData(): void {
    // Load available sprints
    this.sprintService.getSprints()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sprints) => this.availableSprints.set(sprints),
        error: () => console.error('Failed to load sprints')
      });

    // Load available users
    this.userService.getUsers(1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.availableUsers.set(response.items),
        error: () => console.error('Failed to load users')
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadIssues(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load backlog issues (not in sprint)
    this.issueService.getIssues({}, 1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.issues.set(response.items);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading backlog:', err);
          this.error.set('Failed to load backlog issues. Please try again.');
          this.loading.set(false);
        }
      });
  }

  refreshIssues(): void {
    this.loadIssues();
  }

  createIssue(): void {
    this.showIssueDialog.set(true);
  }

  onIssueSubmit(dto: CreateIssueDto | any): void {
    this.issueService.createIssue(dto as CreateIssueDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newIssue) => {
          this.toastService.success('Issue created successfully', `${newIssue.key} has been created`);
          this.showIssueDialog.set(false);
          this.loadIssues(); // Reload to show new issue
        },
        error: (err) => {
          console.error('Failed to create issue:', err);
          this.toastService.error('Failed to create issue', 'Please try again');
        }
      });
  }

  onIssueClick(issue: Issue): void {
    this.router.navigate(['/issues', issue.id]);
  }

  onIssueEdit(issue: Issue): void {
    console.log('Issue edit clicked:', issue);
    // TODO: Phase 1.4 - Open edit dialog
  }

  trackByIssueId(index: number, issue: Issue): string {
    return issue.id;
  }

  trackByEpicId(index: number, group: EpicGroup): string {
    return group.epicId || 'no-epic';
  }

  getEpicColor(epicId: string | null): string {
    if (!epicId) return '#6554C0'; // Default purple for "No Epic"

    // Generate consistent color based on epic ID
    const colors = [
      '#6554C0', // Purple
      '#00875A', // Green
      '#FF5630', // Red
      '#0052CC', // Blue
      '#FF991F', // Orange
      '#00B8D9', // Cyan
    ];

    // Simple hash to get consistent color for same epic
    let hash = 0;
    for (let i = 0; i < epicId.length; i++) {
      hash = epicId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  loadActiveSprint(): void {
    this.sprintService.getActiveSprint()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (active) => {
          this.activeSprint.set(active);

          // Load sprint issues if we have an active sprint
          if (active) {
            this.loadSprintIssues(active.id);
          }
        },
        error: (err) => {
          console.error('Error loading active sprint:', err);
        }
      });
  }

  loadSprintIssues(sprintId: string): void {
    this.issueService.getIssues({ sprint: sprintId }, 1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.sprintIssues.set(response.items);
        },
        error: (err) => {
          console.error('Error loading sprint issues:', err);
        }
      });
  }

  getEpicListIds(): string[] {
    return this.epicGroups().map(group => `epic-list-${group.epicId || 'no-epic'}`);
  }

  isOverCapacity(): boolean {
    const sprint = this.activeSprint();
    if (!sprint) return false;
    const capacity = sprint.capacity || 40;
    return this.sprintPoints() > capacity;
  }

  onDrop(event: CdkDragDrop<Issue[]>): void {
    const issue = event.previousContainer.data[event.previousIndex];

    if (event.previousContainer === event.container) {
      // Reordering within same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between lists
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Determine new sprint assignment
      const isMovingToSprint = event.container.id === 'sprint-list';
      const newSprintId = isMovingToSprint ? this.activeSprint()?.id || null : null;

      // Update issue on backend
      if (issue) {
        this.updateIssueSprint(issue.id, newSprintId);
      }
    }
  }

  updateIssueSprint(issueId: string, sprintId: string | null): void {
    // Prepare the update payload
    const updates: Partial<Issue> = {
      sprint: sprintId ? { id: sprintId } as IssueSprint : undefined
    };

    this.issueService.updateIssue(issueId, updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Issue sprint updated successfully');
        },
        error: (err) => {
          console.error('Error updating issue sprint:', err);
          // Reload to restore correct state
          this.loadIssues();
          if (this.activeSprint()) {
            this.loadSprintIssues(this.activeSprint()!.id);
          }
        }
      });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  onIssueSelect(data: { issue: Issue; selected: boolean }): void {
    const current = new Set(this.selectedIssueIds());

    if (data.selected) {
      current.add(data.issue.id);
    } else {
      current.delete(data.issue.id);
    }

    this.selectedIssueIds.set(current);
  }

  clearSelection(): void {
    this.selectedIssueIds.set(new Set());
  }

  moveSelectedToSprint(): void {
    const sprint = this.activeSprint();
    if (!sprint) return;

    const issueIds = Array.from(this.selectedIssueIds());

    issueIds.forEach(issueId => {
      this.updateIssueSprint(issueId, sprint.id);
    });

    // Clear selection after moving
    this.clearSelection();
  }
}
