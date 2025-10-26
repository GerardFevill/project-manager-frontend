import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
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
  template: `
    <div class="tags-container">
      <mat-form-field appearance="outline" class="tag-input-field">
        <mat-label>Tags</mat-label>
        <input
          matInput
          [(ngModel)]="currentTag"
          (keydown.enter)="addTag($event)"
          (keydown.comma)="addTag($event)"
          placeholder="Ajouter un tag (Enter ou ,)"
          [disabled]="disabled"
        />
      </mat-form-field>

      @if (tags.length > 0) {
        <mat-chip-set class="tags-list">
          @for (tag of tags; track tag) {
            <mat-chip
              [removable]="!disabled"
              (removed)="removeTag(tag)"
            >
              {{ tag }}
              @if (!disabled) {
                <mat-icon matChipRemove>cancel</mat-icon>
              }
            </mat-chip>
          }
        </mat-chip-set>
      }
    </div>
  `,
  styles: [`
    .tags-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }

    .tag-input-field {
      width: 100%;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    mat-chip {
      background-color: var(--accent-color, #0d6efd) !important;
      color: white !important;
    }

    mat-chip mat-icon {
      color: rgba(255, 255, 255, 0.8) !important;
      cursor: pointer;
    }

    mat-chip mat-icon:hover {
      color: white !important;
    }
  `]
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
