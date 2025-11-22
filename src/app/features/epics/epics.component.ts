import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown/dropdown.component';
import { EpicCardComponent } from './epic-card/epic-card.component';
import { EpicFormDialogComponent } from '../../shared/components/epic-form/epic-form-dialog.component';
import { Epic, EpicStatus, EPIC_STATUS_CONFIG } from '../../core/models/epic.model';
import { EpicService } from '../../core/services/epic.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-epics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    IconComponent,
    DropdownComponent,
    EpicCardComponent,
    EpicFormDialogComponent,
  ],
  templateUrl: './epics.component.html',
  styleUrls: ['./epics.component.scss'],
})
export class EpicsComponent implements OnInit {
  // Services
  private epicService = inject(EpicService);
  private toastService = inject(ToastService);

  // Signals
  epics = this.epicService.epics;
  loading = this.epicService.loading;
  error = this.epicService.error;

  searchQuery = signal('');
  statusFilter = signal<EpicStatus | 'all'>('all');
  showCreateDialog = signal(false);
  showEditDialog = signal(false);
  showDeleteDialog = signal(false);
  selectedEpic = signal<Epic | null>(null);

  // Dropdown options for status filter
  statusFilterOptions: DropdownOption<EpicStatus | 'all'>[] = [
    { label: 'All Epics', value: 'all', icon: 'list' },
    {
      label: EPIC_STATUS_CONFIG['to-do'].label,
      value: 'to-do',
      icon: EPIC_STATUS_CONFIG['to-do'].icon,
    },
    {
      label: EPIC_STATUS_CONFIG['in-progress'].label,
      value: 'in-progress',
      icon: EPIC_STATUS_CONFIG['in-progress'].icon,
    },
    {
      label: EPIC_STATUS_CONFIG['done'].label,
      value: 'done',
      icon: EPIC_STATUS_CONFIG['done'].icon,
    },
    {
      label: EPIC_STATUS_CONFIG['cancelled'].label,
      value: 'cancelled',
      icon: EPIC_STATUS_CONFIG['cancelled'].icon,
    },
  ];

  // Computed filtered epics
  filteredEpics = computed(() => {
    let epics = this.epics();
    const query = this.searchQuery().toLowerCase();
    const status = this.statusFilter();

    // Filter by search query
    if (query) {
      epics = epics.filter(
        (epic) =>
          epic.name.toLowerCase().includes(query) ||
          epic.key.toLowerCase().includes(query) ||
          epic.description?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (status !== 'all') {
      epics = epics.filter((epic) => epic.status === status);
    }

    return epics;
  });

  // Stats computed
  stats = computed(() => {
    const allEpics = this.epics();
    return {
      total: allEpics.length,
      active: allEpics.filter((e) => e.status === 'in-progress').length,
      completed: allEpics.filter((e) => e.status === 'done').length,
      planned: allEpics.filter((e) => e.status === 'to-do').length,
    };
  });


  ngOnInit(): void {
    this.loadEpics();
  }

  loadEpics(): void {
    this.epicService.getEpics(1, 100).subscribe();
  }

  openCreateDialog(): void {
    this.showCreateDialog.set(true);
  }

  openEditDialog(epic: Epic): void {
    this.selectedEpic.set(epic);
    this.showEditDialog.set(true);
  }

  openDeleteDialog(epic: Epic): void {
    this.selectedEpic.set(epic);
    this.showDeleteDialog.set(true);
  }

  onEpicCreated(epic: Epic): void {
    this.showCreateDialog.set(false);
    this.loadEpics();
  }

  onEpicUpdated(epic: Epic): void {
    this.showEditDialog.set(false);
    this.selectedEpic.set(null);
    this.loadEpics();
  }

  confirmDelete(): void {
    const epic = this.selectedEpic();
    if (!epic) return;

    this.epicService.deleteEpic(epic.id).subscribe({
      next: () => {
        this.toastService.success('Epic deleted successfully');
        this.showDeleteDialog.set(false);
        this.selectedEpic.set(null);
        this.loadEpics();
      },
      error: (error) => {
        this.toastService.error('Failed to delete epic');
        console.error('Error deleting epic:', error);
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onStatusFilterChange(status: EpicStatus | 'all'): void {
    this.statusFilter.set(status);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
  }

  trackByEpicId(index: number, epic: Epic): string {
    return epic.id;
  }
}
