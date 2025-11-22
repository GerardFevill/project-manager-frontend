import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  forwardRef,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

export interface DropdownOption<T = any> {
  label: string;
  value: T;
  icon?: any;
  color?: string;
  disabled?: boolean;
  group?: string;
}

@Component({
  selector: 'jira-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
})
export class DropdownComponent implements ControlValueAccessor {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() searchable: boolean = false;
  @Input() multiSelect: boolean = false;
  @Input() clearable: boolean = false;
  @Input() disabled: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() label?: string;
  @Input() error?: string;

  @Output() selectionChange = new EventEmitter<any>();

  isOpen = signal(false);
  searchQuery = signal('');
  selectedValue = signal<any>(null);
  selectedValues = signal<any[]>([]);

  // Computed signals
  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.options;

    return this.options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  });

  groupedOptions = computed(() => {
    const options = this.filteredOptions();
    const groups = new Map<string, DropdownOption[]>();

    options.forEach((option) => {
      const groupName = option.group || 'default';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(option);
    });

    return Array.from(groups.entries());
  });

  hasGroups(): boolean {
    return this.options.some(opt => opt.group !== undefined);
  }

  selectedLabel = computed(() => {
    if (this.multiSelect) {
      const selected = this.selectedValues();
      if (selected.length === 0) return this.placeholder;
      if (selected.length === 1) {
        const option = this.options.find((opt) => opt.value === selected[0]);
        return option?.label || this.placeholder;
      }
      return `${selected.length} selected`;
    } else {
      const value = this.selectedValue();
      if (value === null || value === undefined) return this.placeholder;
      const option = this.options.find((opt) => opt.value === value);
      return option?.label || this.placeholder;
    }
  });

  // ControlValueAccessor implementation
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  writeValue(value: any): void {
    if (this.multiSelect) {
      this.selectedValues.set(Array.isArray(value) ? value : []);
    } else {
      this.selectedValue.set(value);
    }
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

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen.update((open) => !open);
    if (this.isOpen()) {
      this.searchQuery.set('');
    }
  }

  selectOption(option: DropdownOption): void {
    if (option.disabled) return;

    if (this.multiSelect) {
      const currentValues = this.selectedValues();
      const index = currentValues.indexOf(option.value);

      if (index > -1) {
        const newValues = [...currentValues];
        newValues.splice(index, 1);
        this.selectedValues.set(newValues);
      } else {
        this.selectedValues.set([...currentValues, option.value]);
      }

      this.onChange(this.selectedValues());
      this.selectionChange.emit(this.selectedValues());
    } else {
      this.selectedValue.set(option.value);
      this.onChange(option.value);
      this.selectionChange.emit(option.value);
      this.isOpen.set(false);
    }

    this.onTouched();
  }

  isSelected(option: DropdownOption): boolean {
    if (this.multiSelect) {
      return this.selectedValues().includes(option.value);
    } else {
      return this.selectedValue() === option.value;
    }
  }

  clearSelection(): void {
    if (this.disabled) return;

    if (this.multiSelect) {
      this.selectedValues.set([]);
      this.onChange([]);
      this.selectionChange.emit([]);
    } else {
      this.selectedValue.set(null);
      this.onChange(null);
      this.selectionChange.emit(null);
    }

    this.onTouched();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  trackByValue(index: number, option: DropdownOption): any {
    return option.value;
  }
}
