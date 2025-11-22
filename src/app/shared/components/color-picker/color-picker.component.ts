import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { EPIC_COLORS } from '../../../core/models/epic.model';

@Component({
  selector: 'jira-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true,
    },
  ],
})
export class ColorPickerComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() disabled: boolean = false;
  @Input() showInput: boolean = true;
  @Input() colors = EPIC_COLORS;

  @Output() colorChange = new EventEmitter<string>();

  selectedColor = signal<string | null>(null);
  customColor = signal<string>('');
  showCustomInput = signal(false);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    if (value) {
      this.selectedColor.set(value);
      // Check if it's a custom color
      const isPredefined = this.colors.some((c) => c.hex === value);
      if (!isPredefined) {
        this.customColor.set(value);
        this.showCustomInput.set(true);
      }
    } else {
      this.selectedColor.set(null);
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

  selectColor(hex: string): void {
    if (this.disabled) return;

    this.selectedColor.set(hex);
    this.showCustomInput.set(false);
    this.onChange(hex);
    this.colorChange.emit(hex);
    this.onTouched();
  }

  toggleCustomInput(): void {
    if (this.disabled) return;
    this.showCustomInput.update((show) => !show);
  }

  onCustomColorInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const color = input.value;
    this.customColor.set(color);

    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      this.selectedColor.set(color);
      this.onChange(color);
      this.colorChange.emit(color);
      this.onTouched();
    }
  }

  clearSelection(): void {
    if (this.disabled) return;

    this.selectedColor.set(null);
    this.customColor.set('');
    this.showCustomInput.set(false);
    this.onChange(null);
    this.colorChange.emit('');
    this.onTouched();
  }

  isSelected(hex: string): boolean {
    return this.selectedColor() === hex;
  }
}
