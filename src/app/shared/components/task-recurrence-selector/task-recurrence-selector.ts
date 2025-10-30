import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TaskRecurrence, TaskRecurrenceHelper } from '../../../core/models';

@Component({
  selector: 'app-task-recurrence-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSelectModule, MatFormFieldModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TaskRecurrenceSelectorComponent),
      multi: true
    }
  ],
  templateUrl: './task-recurrence-selector.html',
  styleUrl: './task-recurrence-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskRecurrenceSelectorComponent implements ControlValueAccessor {
  value: TaskRecurrence = TaskRecurrence.NONE;
  disabled = false;

  // ControlValueAccessor callbacks
  private onChange: (value: TaskRecurrence) => void = () => {};
  private onTouched: () => void = () => {};

  recurrenceOptions = Object.values(TaskRecurrence).map(value => ({
    value,
    label: TaskRecurrenceHelper.getLabel(value)
  }));

  writeValue(value: TaskRecurrence): void {
    if (value) {
      this.value = value;
    }
  }

  registerOnChange(fn: (value: TaskRecurrence) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onValueChange(value: TaskRecurrence): void {
    this.onChange(value);
    this.onTouched();
  }
}
