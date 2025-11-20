import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-label-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="label-picker">
      <div class="selected-labels" *ngIf="selectedLabels.length > 0">
        <span *ngFor="let label of selectedLabels; let i = index" class="label-chip">
          {{ label }}
          <button type="button" (click)="removeLabel(i)" class="remove-btn">
            <jira-icon name="close" [size]="10" />
          </button>
        </span>
      </div>

      <div class="input-row">
        <div class="input-wrapper">
          <input
            type="text"
            [ngModel]="inputValue()"
            (ngModelChange)="inputValue.set($event); onInputChange()"
            (focus)="showSuggestions.set(true)"
            (keydown.enter)="addLabelFromInput(); $event.preventDefault()"
            (keydown.escape)="showSuggestions.set(false)"
            [placeholder]="placeholder"
            class="label-input"
          />
          <jira-icon name="star" [size]="14" class="input-icon" />
        </div>

        <button
          type="button"
          *ngIf="inputValue().trim()"
          class="add-btn"
          (click)="addLabelFromInput()"
        >
          Add
        </button>
      </div>

      <div class="suggestions" *ngIf="showSuggestions() && filteredSuggestions().length > 0">
        <button
          *ngFor="let suggestion of filteredSuggestions()"
          type="button"
          class="suggestion-item"
          (click)="addLabel(suggestion)"
        >
          <jira-icon name="star" [size]="12" />
          <span>{{ suggestion }}</span>
        </button>
      </div>
    </div>

    <div class="overlay" *ngIf="showSuggestions()" (click)="showSuggestions.set(false)"></div>
  `,
  styles: [`
    .label-picker { position: relative; display: flex; flex-direction: column; gap: var(--spacing-sm); }

    .selected-labels { display: flex; flex-wrap: wrap; gap: var(--spacing-xs); }
    .label-chip { display: inline-flex; align-items: center; gap: var(--spacing-xs); padding: 4px var(--spacing-sm); background: var(--jira-brand-bg); color: var(--jira-brand-primary); border-radius: var(--radius-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); }
    .remove-btn { border: none; background: transparent; cursor: pointer; padding: 0; display: flex; align-items: center; color: var(--jira-brand-primary); transition: opacity 0.2s; }
    .remove-btn:hover { opacity: 0.7; }

    .input-row { display: flex; gap: var(--spacing-sm); }
    .input-wrapper { position: relative; flex: 1; }
    .label-input { width: 100%; padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-sm) var(--spacing-sm); border: 1px solid var(--jira-neutral-300); border-radius: var(--radius-sm); font-size: var(--font-size-sm); }
    .label-input:focus { outline: none; border-color: var(--jira-brand-primary); }
    .input-icon { position: absolute; right: var(--spacing-sm); top: 50%; transform: translateY(-50%); color: var(--jira-neutral-500); pointer-events: none; }
    .add-btn { padding: var(--spacing-sm) var(--spacing-md); border: none; background: var(--jira-brand-primary); color: white; border-radius: var(--radius-sm); font-size: var(--font-size-sm); cursor: pointer; transition: background 0.2s; }
    .add-btn:hover { background: var(--jira-brand-hover); }

    .suggestions { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: white; border: 1px solid var(--jira-neutral-300); border-radius: var(--radius-md); box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1001; max-height: 200px; overflow-y: auto; }
    .suggestion-item { display: flex; align-items: center; gap: var(--spacing-sm); width: 100%; padding: var(--spacing-sm); border: none; background: transparent; text-align: left; cursor: pointer; font-size: var(--font-size-sm); transition: background 0.2s; }
    .suggestion-item:hover { background: var(--jira-neutral-100); }

    .overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; }
  `]
})
export class LabelPickerComponent {
  @Input() selectedLabels: string[] = [];
  @Input() suggestions: string[] = [];
  @Input() placeholder = 'Add labels...';
  @Input() allowCustomLabels = true;
  @Output() labelsChanged = new EventEmitter<string[]>();

  inputValue = signal('');
  showSuggestions = signal(false);

  filteredSuggestions = computed(() => {
    const query = this.inputValue().toLowerCase().trim();
    if (!query) return this.suggestions.filter(s => !this.selectedLabels.includes(s));

    return this.suggestions
      .filter(s => !this.selectedLabels.includes(s))
      .filter(s => s.toLowerCase().includes(query));
  });

  onInputChange(): void {
    this.showSuggestions.set(this.inputValue().trim().length > 0);
  }

  addLabel(label: string): void {
    if (!label.trim() || this.selectedLabels.includes(label)) return;

    const newLabels = [...this.selectedLabels, label];
    this.labelsChanged.emit(newLabels);
    this.inputValue.set('');
    this.showSuggestions.set(false);
  }

  addLabelFromInput(): void {
    const label = this.inputValue().trim();
    if (!label) return;

    if (!this.allowCustomLabels && !this.suggestions.includes(label)) {
      // Only allow labels from suggestions
      return;
    }

    this.addLabel(label);
  }

  removeLabel(index: number): void {
    const newLabels = this.selectedLabels.filter((_, i) => i !== index);
    this.labelsChanged.emit(newLabels);
  }
}
