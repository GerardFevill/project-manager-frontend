import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'jira-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-wrapper">
      <label *ngIf="label" [for]="id" class="input-label">
        {{ label }}
        <span *ngIf="required" class="required-mark">*</span>
      </label>

      <div [class]="inputContainerClasses">
        <span *ngIf="prefixIcon" class="input-prefix">
          <ng-content select="[prefix]"></ng-content>
        </span>

        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [value]="value"
          [class]="inputClasses"
          (input)="onInput($event)"
          (blur)="onTouched()"
          (focus)="onFocus.emit($event)"
        />

        <span *ngIf="suffixIcon" class="input-suffix">
          <ng-content select="[suffix]"></ng-content>
        </span>
      </div>

      <span *ngIf="hint && !error" class="input-hint">{{ hint }}</span>
      <span *ngIf="error" class="input-error">{{ error }}</span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .input-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--jira-neutral-800);
    }

    .required-mark {
      color: var(--jira-danger);
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--jira-neutral-0);
      border: 2px solid var(--jira-neutral-300);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);

      &:focus-within {
        border-color: var(--jira-brand-primary);
        box-shadow: 0 0 0 1px var(--jira-brand-primary);
      }

      &.input-disabled {
        background: var(--jira-neutral-100);
        cursor: not-allowed;
      }

      &.input-error {
        border-color: var(--jira-danger);

        &:focus-within {
          border-color: var(--jira-danger);
          box-shadow: 0 0 0 1px var(--jira-danger);
        }
      }
    }

    .input-prefix,
    .input-suffix {
      display: flex;
      align-items: center;
      padding: 0 var(--spacing-md);
      color: var(--jira-neutral-600);
    }

    input {
      flex: 1;
      height: 36px;
      padding: 0 var(--spacing-md);
      border: none;
      background: transparent;
      font-family: var(--font-family);
      font-size: var(--font-size-md);
      color: var(--jira-neutral-1000);
      outline: none;

      &::placeholder {
        color: var(--jira-neutral-500);
      }

      &:disabled {
        cursor: not-allowed;
        color: var(--jira-neutral-500);
      }
    }

    .input-small input {
      height: 32px;
      font-size: var(--font-size-sm);
    }

    .input-large input {
      height: 44px;
      font-size: var(--font-size-lg);
    }

    .input-hint {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-600);
    }

    .input-error {
      font-size: var(--font-size-sm);
      color: var(--jira-danger);
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = `input-${Math.random().toString(36).substr(2, 9)}`;
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() prefixIcon = false;
  @Input() suffixIcon = false;

  @Output() onFocus = new EventEmitter<FocusEvent>();
  @Output() onBlur = new EventEmitter<FocusEvent>();

  value = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  get inputContainerClasses(): string {
    const classes = ['input-container', `input-${this.size}`];

    if (this.disabled) {
      classes.push('input-disabled');
    }

    if (this.error) {
      classes.push('input-error');
    }

    return classes.join(' ');
  }

  get inputClasses(): string {
    return '';
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  writeValue(value: any): void {
    this.value = value || '';
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
}
