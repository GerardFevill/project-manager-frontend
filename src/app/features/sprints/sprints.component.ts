import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SprintCardComponent } from './sprint-card/sprint-card.component';
import { SprintFormDialogComponent, CreateSprintDto } from '../../shared/components/sprint-form/sprint-form-dialog.component';
import { SprintService, Sprint } from '../../core/services/sprint.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-sprints',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, SprintCardComponent, SprintFormDialogComponent],
  template: `
    <div class="sprints-page">
      <!-- Header -->
      <div class="sprints-header">
        <div class="header-title">
          <h1>Sprints</h1>
          <span class="sprint-count" *ngIf="!loading()">
            {{ sprints().length }} sprints
          </span>
        </div>

        <div class="header-actions">
          <jira-button
            variant="subtle"
            size="medium"
            (clicked)="refreshSprints()"
            [disabled]="loading()"
          >
            <jira-icon leftIcon name="arrow-up" [size]="16" />
            Refresh
          </jira-button>

          <jira-button
            variant="primary"
            size="medium"
            (clicked)="createSprint()"
          >
            <jira-icon leftIcon name="plus" [size]="16" />
            Create Sprint
          </jira-button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading-state">
        <div class="spinner"></div>
        <p>Loading sprints...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="!loading() && error()" class="error-state">
        <jira-icon name="warning" [size]="48" color="var(--jira-danger)" />
        <p>{{ error() }}</p>
        <jira-button variant="primary" (clicked)="refreshSprints()">
          Retry
        </jira-button>
      </div>

      <!-- Sprints List -->
      <div *ngIf="!loading() && !error()" class="sprints-content">
        <!-- Active Sprint -->
        <div class="sprint-section" *ngIf="activeSprints().length > 0">
          <h2 class="section-title">
            <jira-icon name="sprint" [size]="20" />
            Active Sprint
          </h2>
          <div class="sprint-grid">
            <app-sprint-card
              *ngFor="let sprint of activeSprints(); trackBy: trackBySprint"
              [sprint]="sprint"
              (startSprint)="onStartSprint($event)"
              (completeSprint)="onCompleteSprint($event)"
              (viewSprint)="onViewSprint($event)"
            />
          </div>
        </div>

        <!-- Planned Sprints -->
        <div class="sprint-section" *ngIf="plannedSprints().length > 0">
          <h2 class="section-title">
            <jira-icon name="calendar" [size]="20" />
            Planned Sprints
          </h2>
          <div class="sprint-grid">
            <app-sprint-card
              *ngFor="let sprint of plannedSprints(); trackBy: trackBySprint"
              [sprint]="sprint"
              (startSprint)="onStartSprint($event)"
              (completeSprint)="onCompleteSprint($event)"
              (viewSprint)="onViewSprint($event)"
            />
          </div>
        </div>

        <!-- Completed Sprints -->
        <div class="sprint-section" *ngIf="completedSprints().length > 0">
          <h2 class="section-title">
            <jira-icon name="check" [size]="20" />
            Completed Sprints
            <span class="count">({{ completedSprints().length }})</span>
          </h2>
          <div class="sprint-grid">
            <app-sprint-card
              *ngFor="let sprint of completedSprints().slice(0, showAllCompleted() ? undefined : 3); trackBy: trackBySprint"
              [sprint]="sprint"
              (startSprint)="onStartSprint($event)"
              (completeSprint)="onCompleteSprint($event)"
              (viewSprint)="onViewSprint($event)"
            />
          </div>
          <jira-button
            *ngIf="completedSprints().length > 3 && !showAllCompleted()"
            variant="subtle"
            size="medium"
            (clicked)="toggleShowAllCompleted()"
          >
            Show {{ completedSprints().length - 3 }} more
          </jira-button>
        </div>

        <!-- Empty State -->
        <div *ngIf="sprints().length === 0" class="empty-state">
          <jira-icon name="issues" [size]="64" color="var(--jira-neutral-400)" />
          <h2>No sprints yet</h2>
          <p>Create your first sprint to get started</p>
          <jira-button variant="primary" size="large" (clicked)="createSprint()">
            <jira-icon leftIcon name="plus" [size]="16" />
            Create Sprint
          </jira-button>
        </div>
      </div>
    </div>

    <!-- Sprint Form Dialog -->
    <app-sprint-form-dialog
      *ngIf="showSprintDialog()"
      (submit)="onSprintSubmit($event)"
      (cancel)="showSprintDialog.set(false)"
    />
  `,
  styles: [`
    .sprints-page {
      padding: var(--spacing-xl);
      max-width: 1400px;
      margin: 0 auto;
    }

    .sprints-header {
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

      h1 {
        margin: 0;
        color: var(--jira-neutral-1000);
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-semibold);
      }
    }

    .sprint-count {
      font-size: var(--font-size-md);
      color: var(--jira-neutral-600);
      background: var(--jira-neutral-100);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
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

    .sprints-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2xl);
    }

    .sprint-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      margin: 0;

      .count {
        font-size: var(--font-size-md);
        color: var(--jira-neutral-600);
        font-weight: var(--font-weight-normal);
      }
    }

    .sprint-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--spacing-lg);
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
export class SprintsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  sprints = signal<Sprint[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  showAllCompleted = signal(false);
  showSprintDialog = signal(false);

  // Computed sprints by status
  activeSprints = computed(() =>
    this.sprints().filter(s => s.status === 'active')
  );

  plannedSprints = computed(() =>
    this.sprints().filter(s => s.status === 'planned')
  );

  completedSprints = computed(() =>
    this.sprints()
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
  );

  constructor(
    private sprintService: SprintService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSprints();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSprints(): void {
    this.loading.set(true);
    this.error.set(null);

    this.sprintService.getSprints()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sprints) => {
          this.sprints.set(sprints);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading sprints:', err);
          this.error.set('Failed to load sprints. Please try again.');
          this.loading.set(false);
        }
      });
  }

  refreshSprints(): void {
    this.loadSprints();
  }

  createSprint(): void {
    this.showSprintDialog.set(true);
  }

  onSprintSubmit(dto: CreateSprintDto | any): void {
    this.sprintService.createSprint(dto as CreateSprintDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newSprint) => {
          this.toastService.success('Sprint created successfully', `${newSprint.name} has been created`);
          this.showSprintDialog.set(false);
          this.loadSprints(); // Reload to show new sprint
        },
        error: (err) => {
          console.error('Failed to create sprint:', err);
          this.toastService.error('Failed to create sprint', 'Please try again');
        }
      });
  }

  onStartSprint(sprint: Sprint): void {
    console.log('Start sprint:', sprint);
    // TODO: Phase 3.2 - Implement start sprint
  }

  onCompleteSprint(sprint: Sprint): void {
    console.log('Complete sprint:', sprint);
    // TODO: Phase 3.2 - Implement complete sprint
  }

  onViewSprint(sprint: Sprint): void {
    console.log('View sprint:', sprint);
    // TODO: Phase 3.3 - Navigate to sprint detail
  }

  toggleShowAllCompleted(): void {
    this.showAllCompleted.set(!this.showAllCompleted());
  }

  trackBySprint(index: number, sprint: Sprint): string {
    return sprint.id;
  }
}
