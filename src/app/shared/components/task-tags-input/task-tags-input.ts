import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-task-tags-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TaskTagsInputComponent),
      multi: true
    }
  ],
  templateUrl: './task-tags-input.html',
  styleUrl: './task-tags-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskTagsInputComponent implements ControlValueAccessor {
  tags: string[] = [];
  currentTag = '';
  disabled = false;

  // ControlValueAccessor callbacks
  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[]): void {
    if (value) {
      this.tags = value;
    }
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  addTag(event: Event): void {
    event.preventDefault();

    const tag = this.currentTag.trim().replace(',', '');

    if (tag && !this.tags.includes(tag) && this.tags.length < 20) {
      this.tags = [...this.tags, tag];
      this.currentTag = '';
      this.onChange(this.tags);
      this.onTouched();
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
    this.onChange(this.tags);
    this.onTouched();
  }
}
