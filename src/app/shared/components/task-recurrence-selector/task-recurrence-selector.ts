import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
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
  template: `
    <mat-form-field appearance="outline" class="recurrence-field">
      <mat-label>Récurrence</mat-label>
      <mat-select
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        [disabled]="disabled"
      >
        @for (option of recurrenceOptions; track option.value) {
          <mat-option [value]="option.value">
            {{ option.label }}
          </mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    .recurrence-field {
      width: 100%;
    }

    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }
  `]
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
