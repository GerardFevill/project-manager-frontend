import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { DropdownComponent, DropdownOption } from '../dropdown/dropdown.component';
import { InputComponent } from '../input/input.component';
import { Epic, CreateEpicDto, UpdateEpicDto, EpicStatus, EPIC_STATUS_CONFIG } from '../../../core/models/epic.model';
import { EpicService } from '../../../core/services/epic.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'jira-epic-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    ButtonComponent,
    IconComponent,
    ColorPickerComponent,
    DropdownComponent,
    InputComponent,
  ],
  templateUrl: './epic-form-dialog.component.html',
  styleUrls: ['./epic-form-dialog.component.scss'],
})
export class EpicFormDialogComponent implements OnInit {
  @Input() isOpen = signal(false);
  @Input() epic: Epic | null = null;
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() closed = new EventEmitter<void>();
  @Output() epicCreated = new EventEmitter<Epic>();
  @Output() epicUpdated = new EventEmitter<Epic>();

  // Form fields
  name = signal('');
  description = signal('');
  color = signal('');
  status = signal<EpicStatus>('to-do');
  startDate = signal('');
  targetDate = signal('');

  // Form state
  isSubmitting = signal(false);
  errors = signal<Record<string, string>>({});

  // Dropdown options
  statusOptions: DropdownOption<EpicStatus>[] = [
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

  constructor(
    private epicService: EpicService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.epic && this.mode === 'edit') {
      this.loadEpicData();
    }
  }

  loadEpicData(): void {
    if (!this.epic) return;

    this.name.set(this.epic.name);
    this.description.set(this.epic.description || '');
    this.color.set(this.epic.color || '');
    this.status.set(this.epic.status);
    this.startDate.set(this.epic.startDate ? this.formatDate(this.epic.startDate) : '');
    this.targetDate.set(this.epic.targetDate ? this.formatDate(this.epic.targetDate) : '');
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!this.name().trim()) {
      newErrors['name'] = 'Epic name is required';
    } else if (this.name().length > 255) {
      newErrors['name'] = 'Epic name must be less than 255 characters';
    }

    if (this.startDate() && this.targetDate()) {
      const start = new Date(this.startDate());
      const target = new Date(this.targetDate());
      if (start > target) {
        newErrors['targetDate'] = 'Target date must be after start date';
      }
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async handleSubmit(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting.set(true);

    try {
      if (this.mode === 'create') {
        await this.createEpic();
      } else {
        await this.updateEpic();
      }
    } catch (error: any) {
      console.error('Error submitting epic:', error);
      this.toastService.error(error.message || 'Failed to save epic');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async createEpic(): Promise<void> {
    const dto: CreateEpicDto = {
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      color: this.color() || undefined,
      status: this.status(),
      startDate: this.startDate() ? new Date(this.startDate()) : undefined,
      targetDate: this.targetDate() ? new Date(this.targetDate()) : undefined,
    };

    this.epicService.createEpic(dto).subscribe({
      next: (epic) => {
        this.toastService.success('Epic created successfully');
        this.epicCreated.emit(epic);
        this.close();
      },
      error: (error) => {
        throw error;
      },
    });
  }

  async updateEpic(): Promise<void> {
    if (!this.epic) return;

    const dto: UpdateEpicDto = {
      name: this.name().trim(),
      description: this.description().trim() || undefined,
      color: this.color() || undefined,
      status: this.status(),
      startDate: this.startDate() ? new Date(this.startDate()) : undefined,
      targetDate: this.targetDate() ? new Date(this.targetDate()) : undefined,
    };

    this.epicService.updateEpic(this.epic.id, dto).subscribe({
      next: (epic) => {
        this.toastService.success('Epic updated successfully');
        this.epicUpdated.emit(epic);
        this.close();
      },
      error: (error) => {
        throw error;
      },
    });
  }

  close(): void {
    this.resetForm();
    this.closed.emit();
  }

  resetForm(): void {
    this.name.set('');
    this.description.set('');
    this.color.set('');
    this.status.set('to-do');
    this.startDate.set('');
    this.targetDate.set('');
    this.errors.set({});
  }

  onStatusChange(status: EpicStatus): void {
    this.status.set(status);
  }

  onColorChange(color: string): void {
    this.color.set(color);
  }
}
