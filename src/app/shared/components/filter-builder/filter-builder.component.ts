import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { ButtonComponent } from '../button/button.component';

export interface FilterCondition {
  id: string;
  field: FilterField;
  operator: FilterOperator;
  value: string | string[];
}

export interface Filter {
  id: string;
  name: string;
  description?: string;
  conditions: FilterCondition[];
  logic: 'AND' | 'OR';
}

export type FilterField =
  | 'status'
  | 'priority'
  | 'assignee'
  | 'reporter'
  | 'type'
  | 'label'
  | 'sprint'
  | 'project'
  | 'created'
  | 'updated'
  | 'dueDate';

export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'in'
  | 'notIn'
  | 'greaterThan'
  | 'lessThan'
  | 'isEmpty'
  | 'isNotEmpty';

interface FieldDefinition {
  field: FilterField;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'user';
  operators: FilterOperator[];
  options?: { value: string; label: string }[];
}

@Component({
  selector: 'app-filter-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ButtonComponent],
  template: `
    <div class="filter-builder">
      <div class="filter-header">
        <div class="filter-name">
          <input
            type="text"
            class="filter-name-input"
            [(ngModel)]="currentFilter.name"
            placeholder="Filter name"
          />
          <input
            type="text"
            class="filter-desc-input"
            [(ngModel)]="currentFilter.description"
            placeholder="Description (optional)"
          />
        </div>

        <div class="filter-logic">
          <label class="logic-label">Match:</label>
          <div class="logic-toggle">
            <button
              class="logic-btn"
              [class.active]="currentFilter.logic === 'AND'"
              (click)="currentFilter.logic = 'AND'"
            >
              All
            </button>
            <button
              class="logic-btn"
              [class.active]="currentFilter.logic === 'OR'"
              (click)="currentFilter.logic = 'OR'"
            >
              Any
            </button>
          </div>
        </div>
      </div>

      <div class="conditions-list">
        <div
          *ngFor="let condition of currentFilter.conditions; let i = index"
          class="condition-row"
        >
          <div class="condition-number">{{ i + 1 }}</div>

          <select
            class="condition-select field-select"
            [(ngModel)]="condition.field"
            (ngModelChange)="onFieldChange(condition)"
          >
            <option *ngFor="let field of fields" [value]="field.field">
              {{ field.label }}
            </option>
          </select>

          <select
            class="condition-select operator-select"
            [(ngModel)]="condition.operator"
          >
            <option *ngFor="let op of getOperatorsForField(condition.field)" [value]="op">
              {{ getOperatorLabel(op) }}
            </option>
          </select>

          <input
            *ngIf="getFieldType(condition.field) === 'text' || getFieldType(condition.field) === 'date'"
            type="text"
            class="condition-input"
            [(ngModel)]="condition.value"
            [placeholder]="getValuePlaceholder(condition.field)"
          />

          <select
            *ngIf="getFieldType(condition.field) === 'select'"
            class="condition-select value-select"
            [(ngModel)]="condition.value"
          >
            <option value="">Select...</option>
            <option *ngFor="let opt of getFieldOptions(condition.field)" [value]="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <button
            class="remove-btn"
            (click)="removeCondition(i)"
            title="Remove condition"
          >
            <jira-icon name="close" [size]="16" />
          </button>
        </div>

        <div *ngIf="currentFilter.conditions.length === 0" class="empty-state">
          <jira-icon name="filter" [size]="32" color="var(--jira-neutral-400)" />
          <p>No conditions added</p>
          <span>Click "Add Condition" to start building your filter</span>
        </div>
      </div>

      <div class="filter-actions">
        <jira-button
          variant="subtle"
          size="medium"
          (clicked)="addCondition()"
        >
          <jira-icon leftIcon name="plus" [size]="16" />
          Add Condition
        </jira-button>

        <div class="right-actions">
          <jira-button
            variant="secondary"
            size="medium"
            (clicked)="onCancel()"
          >
            Cancel
          </jira-button>
          <jira-button
            variant="primary"
            size="medium"
            (clicked)="onSave()"
            [disabled]="!isValid()"
          >
            Save Filter
          </jira-button>
        </div>
      </div>

      <!-- JQL Preview -->
      <div class="jql-preview" *ngIf="currentFilter.conditions.length > 0">
        <div class="jql-label">JQL Preview:</div>
        <code class="jql-code">{{ getJQLPreview() }}</code>
      </div>
    </div>
  `,
  styles: [`
    .filter-builder {
      background: var(--jira-neutral-0);
      border-radius: var(--radius-lg);
      border: 2px solid var(--jira-neutral-200);
      overflow: hidden;
    }

    .filter-header {
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--jira-neutral-200);
      background: var(--jira-neutral-50);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .filter-name {
      flex: 1;
      min-width: 250px;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .filter-name-input,
    .filter-desc-input {
      padding: var(--spacing-sm) var(--spacing-md);
      border: 2px solid var(--jira-neutral-300);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-1000);
      background: var(--jira-neutral-0);
      transition: border-color var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--jira-brand-primary);
      }

      &::placeholder {
        color: var(--jira-neutral-500);
      }
    }

    .filter-name-input {
      font-weight: var(--font-weight-semibold);
    }

    .filter-logic {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .logic-label {
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-700);
      font-weight: var(--font-weight-medium);
    }

    .logic-toggle {
      display: flex;
      background: var(--jira-neutral-200);
      border-radius: var(--radius-sm);
      padding: 2px;
    }

    .logic-btn {
      padding: var(--spacing-xs) var(--spacing-md);
      border: none;
      background: transparent;
      color: var(--jira-neutral-700);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);

      &.active {
        background: var(--jira-neutral-0);
        color: var(--jira-brand-primary);
        box-shadow: var(--shadow-sm);
      }

      &:hover:not(.active) {
        color: var(--jira-neutral-1000);
      }
    }

    .conditions-list {
      padding: var(--spacing-lg);
      min-height: 200px;
      max-height: 400px;
      overflow-y: auto;
    }

    .condition-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
      background: var(--jira-neutral-50);
      border: 1px solid var(--jira-neutral-200);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-sm);

      &:last-child {
        margin-bottom: 0;
      }
    }

    .condition-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: var(--jira-brand-primary);
      color: var(--jira-neutral-0);
      border-radius: 50%;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      flex-shrink: 0;
    }

    .condition-select,
    .condition-input {
      padding: var(--spacing-xs) var(--spacing-sm);
      border: 1px solid var(--jira-neutral-300);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-1000);
      background: var(--jira-neutral-0);
      transition: border-color var(--transition-fast);

      &:focus {
        outline: none;
        border-color: var(--jira-brand-primary);
      }
    }

    .field-select {
      min-width: 120px;
      flex: 1;
    }

    .operator-select {
      min-width: 100px;
      flex: 1;
    }

    .value-select,
    .condition-input {
      min-width: 150px;
      flex: 2;
    }

    .remove-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-600);
      cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;

      &:hover {
        background: var(--jira-danger-bg);
        color: var(--jira-danger);
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-3xl);
      text-align: center;

      p {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--jira-neutral-800);
        margin: var(--spacing-md) 0 var(--spacing-xs) 0;
      }

      span {
        color: var(--jira-neutral-600);
        font-size: var(--font-size-sm);
      }
    }

    .filter-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-lg);
      border-top: 1px solid var(--jira-neutral-200);
      background: var(--jira-neutral-50);
    }

    .right-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .jql-preview {
      padding: var(--spacing-lg);
      border-top: 1px solid var(--jira-neutral-200);
      background: var(--jira-neutral-900);
    }

    .jql-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--jira-neutral-500);
      margin-bottom: var(--spacing-xs);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .jql-code {
      display: block;
      padding: var(--spacing-md);
      background: var(--jira-neutral-1000);
      border-radius: var(--radius-sm);
      color: #61DAFB;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
      font-size: var(--font-size-sm);
      line-height: 1.6;
      overflow-x: auto;
    }

    @media (max-width: 768px) {
      .condition-row {
        flex-wrap: wrap;
      }

      .field-select,
      .operator-select,
      .value-select,
      .condition-input {
        min-width: 100%;
      }
    }
  `]
})
export class FilterBuilderComponent {
  @Input() filter?: Filter;
  @Output() save = new EventEmitter<Filter>();
  @Output() cancel = new EventEmitter<void>();

  currentFilter: Filter = {
    id: this.generateId(),
    name: '',
    description: '',
    conditions: [],
    logic: 'AND'
  };

  fields: FieldDefinition[] = [
    {
      field: 'status',
      label: 'Status',
      type: 'select',
      operators: ['equals', 'notEquals', 'in', 'notIn'],
      options: [
        { value: 'todo', label: 'To Do' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'review', label: 'In Review' },
        { value: 'done', label: 'Done' },
        { value: 'blocked', label: 'Blocked' }
      ]
    },
    {
      field: 'priority',
      label: 'Priority',
      type: 'select',
      operators: ['equals', 'notEquals', 'in', 'notIn'],
      options: [
        { value: 'highest', label: 'Highest' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
        { value: 'lowest', label: 'Lowest' }
      ]
    },
    {
      field: 'type',
      label: 'Type',
      type: 'select',
      operators: ['equals', 'notEquals', 'in', 'notIn'],
      options: [
        { value: 'story', label: 'Story' },
        { value: 'task', label: 'Task' },
        { value: 'bug', label: 'Bug' },
        { value: 'epic', label: 'Epic' },
        { value: 'subtask', label: 'Sub-task' }
      ]
    },
    {
      field: 'assignee',
      label: 'Assignee',
      type: 'user',
      operators: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty']
    },
    {
      field: 'reporter',
      label: 'Reporter',
      type: 'user',
      operators: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty']
    },
    {
      field: 'label',
      label: 'Labels',
      type: 'text',
      operators: ['contains', 'notContains', 'isEmpty', 'isNotEmpty']
    },
    {
      field: 'sprint',
      label: 'Sprint',
      type: 'text',
      operators: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty']
    },
    {
      field: 'project',
      label: 'Project',
      type: 'text',
      operators: ['equals', 'notEquals']
    },
    {
      field: 'created',
      label: 'Created',
      type: 'date',
      operators: ['greaterThan', 'lessThan', 'equals']
    },
    {
      field: 'updated',
      label: 'Updated',
      type: 'date',
      operators: ['greaterThan', 'lessThan', 'equals']
    },
    {
      field: 'dueDate',
      label: 'Due Date',
      type: 'date',
      operators: ['greaterThan', 'lessThan', 'equals', 'isEmpty', 'isNotEmpty']
    }
  ];

  ngOnInit() {
    if (this.filter) {
      this.currentFilter = { ...this.filter };
    }
  }

  addCondition(): void {
    this.currentFilter.conditions.push({
      id: this.generateId(),
      field: 'status',
      operator: 'equals',
      value: ''
    });
  }

  removeCondition(index: number): void {
    this.currentFilter.conditions.splice(index, 1);
  }

  onFieldChange(condition: FilterCondition): void {
    const field = this.fields.find(f => f.field === condition.field);
    if (field && field.operators.length > 0) {
      condition.operator = field.operators[0];
    }
    condition.value = '';
  }

  getOperatorsForField(field: FilterField): FilterOperator[] {
    const fieldDef = this.fields.find(f => f.field === field);
    return fieldDef?.operators || [];
  }

  getOperatorLabel(operator: FilterOperator): string {
    const labels: Record<FilterOperator, string> = {
      equals: 'equals',
      notEquals: 'not equals',
      contains: 'contains',
      notContains: 'does not contain',
      in: 'in',
      notIn: 'not in',
      greaterThan: 'after',
      lessThan: 'before',
      isEmpty: 'is empty',
      isNotEmpty: 'is not empty'
    };
    return labels[operator] || operator;
  }

  getFieldType(field: FilterField): string {
    const fieldDef = this.fields.find(f => f.field === field);
    return fieldDef?.type || 'text';
  }

  getFieldOptions(field: FilterField): { value: string; label: string }[] {
    const fieldDef = this.fields.find(f => f.field === field);
    return fieldDef?.options || [];
  }

  getValuePlaceholder(field: FilterField): string {
    const fieldDef = this.fields.find(f => f.field === field);
    if (fieldDef?.type === 'date') return 'YYYY-MM-DD';
    if (fieldDef?.type === 'user') return 'Username or email';
    return 'Enter value...';
  }

  getJQLPreview(): string {
    const conditions = this.currentFilter.conditions.map(c => {
      const operator = this.getJQLOperator(c.operator);
      const value = this.formatJQLValue(c);
      return `${c.field} ${operator} ${value}`;
    });

    return conditions.join(` ${this.currentFilter.logic} `);
  }

  private getJQLOperator(operator: FilterOperator): string {
    const mapping: Record<FilterOperator, string> = {
      equals: '=',
      notEquals: '!=',
      contains: '~',
      notContains: '!~',
      in: 'IN',
      notIn: 'NOT IN',
      greaterThan: '>',
      lessThan: '<',
      isEmpty: 'IS EMPTY',
      isNotEmpty: 'IS NOT EMPTY'
    };
    return mapping[operator] || '=';
  }

  private formatJQLValue(condition: FilterCondition): string {
    if (condition.operator === 'isEmpty' || condition.operator === 'isNotEmpty') {
      return '';
    }
    if (typeof condition.value === 'string') {
      return `"${condition.value}"`;
    }
    return `(${condition.value.map(v => `"${v}"`).join(', ')})`;
  }

  isValid(): boolean {
    return (
      this.currentFilter.name.trim().length > 0 &&
      this.currentFilter.conditions.length > 0 &&
      this.currentFilter.conditions.every(c => {
        if (c.operator === 'isEmpty' || c.operator === 'isNotEmpty') {
          return true;
        }
        return c.value && c.value.toString().trim().length > 0;
      })
    );
  }

  onSave(): void {
    if (this.isValid()) {
      this.save.emit(this.currentFilter);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
