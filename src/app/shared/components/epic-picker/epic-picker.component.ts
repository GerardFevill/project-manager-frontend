import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  forwardRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownComponent, DropdownOption } from '../dropdown/dropdown.component';
import { IconComponent } from '../icon/icon.component';
import { Epic } from '../../../core/models/epic.model';
import { EpicService } from '../../../core/services/epic.service';

@Component({
  selector: 'jira-epic-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent, IconComponent],
  templateUrl: './epic-picker.component.html',
  styleUrls: ['./epic-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EpicPickerComponent),
      multi: true,
    },
  ],
})
export class EpicPickerComponent implements ControlValueAccessor, OnInit {
  @Input() label?: string = 'Epic';
  @Input() placeholder: string = 'Select an epic';
  @Input() disabled: boolean = false;
  @Input() error?: string;
  @Input() showCreateOption: boolean = false;

  @Output() epicChange = new EventEmitter<string | null>();
  @Output() createEpic = new EventEmitter<void>();

  private epicService = inject(EpicService);

  selectedEpicId = signal<string | null>(null);
  epics = this.epicService.epics;
  loading = this.epicService.loading;

  // Computed dropdown options
  epicOptions = computed<DropdownOption<string | null>[]>(() => {
    const epics = this.epics();
    const options: DropdownOption<string | null>[] = [
      { label: 'No Epic', value: null, icon: 'times' },
    ];

    epics.forEach((epic) => {
      options.push({
        label: `${epic.key} - ${epic.name}`,
        value: epic.id,
        icon: 'zap',
        color: epic.color,
      });
    });

    return options;
  });

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    // Load epics if not already loaded
    if (this.epics().length === 0 && !this.loading()) {
      this.epicService.getEpics(1, 100).subscribe();
    }
  }

  writeValue(value: string | null): void {
    this.selectedEpicId.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(epicId: string | null): void {
    this.selectedEpicId.set(epicId);
    this.onChange(epicId);
    this.epicChange.emit(epicId);
    this.onTouched();
  }

  onCreateClick(): void {
    this.createEpic.emit();
  }
}
