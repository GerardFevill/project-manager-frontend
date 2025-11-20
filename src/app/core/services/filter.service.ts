import { Injectable, signal } from '@angular/core';
import { Filter, FilterCondition } from '../../shared/components/filter-builder/filter-builder.component';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private readonly STORAGE_KEY = 'jira-filters';
  private readonly ACTIVE_FILTER_KEY = 'jira-active-filter';

  // Signals for reactive state
  savedFilters = signal<Filter[]>([]);
  activeFilter = signal<Filter | null>(null);

  constructor() {
    this.loadFilters();
  }

  /**
   * Load saved filters from localStorage
   */
  private loadFilters(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const filters = JSON.parse(stored) as Filter[];
        this.savedFilters.set(filters);

        // Load active filter
        const activeId = localStorage.getItem(this.ACTIVE_FILTER_KEY);
        if (activeId) {
          const active = filters.find(f => f.id === activeId);
          if (active) {
            this.activeFilter.set(active);
          }
        }
      } catch (error) {
        console.error('Failed to load filters:', error);
      }
    }
  }

  /**
   * Save filters to localStorage
   */
  private saveFilters(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.savedFilters()));

    const active = this.activeFilter();
    if (active) {
      localStorage.setItem(this.ACTIVE_FILTER_KEY, active.id);
    } else {
      localStorage.removeItem(this.ACTIVE_FILTER_KEY);
    }
  }

  /**
   * Save a new filter or update existing one
   */
  saveFilter(filter: Filter): void {
    const filters = this.savedFilters();
    const existingIndex = filters.findIndex(f => f.id === filter.id);

    if (existingIndex >= 0) {
      // Update existing filter
      filters[existingIndex] = filter;
      this.savedFilters.set([...filters]);
    } else {
      // Add new filter
      this.savedFilters.set([...filters, filter]);
    }

    this.saveFilters();
  }

  /**
   * Delete a filter
   */
  deleteFilter(filterId: string): void {
    const filters = this.savedFilters().filter(f => f.id !== filterId);
    this.savedFilters.set(filters);

    // Clear active filter if it was deleted
    if (this.activeFilter()?.id === filterId) {
      this.activeFilter.set(null);
    }

    this.saveFilters();
  }

  /**
   * Set active filter (apply globally)
   */
  setActiveFilter(filter: Filter | null): void {
    this.activeFilter.set(filter);
    this.saveFilters();
  }

  /**
   * Get filter by ID
   */
  getFilter(filterId: string): Filter | undefined {
    return this.savedFilters().find(f => f.id === filterId);
  }

  /**
   * Apply filter to data (this would be used by widgets)
   */
  applyFilter<T>(data: T[], filter: Filter | null, fieldMapper?: (item: T, field: string) => any): T[] {
    if (!filter || filter.conditions.length === 0) {
      return data;
    }

    return data.filter(item => {
      const results = filter.conditions.map(condition =>
        this.evaluateCondition(item, condition, fieldMapper)
      );

      return filter.logic === 'AND'
        ? results.every(r => r)
        : results.some(r => r);
    });
  }

  /**
   * Evaluate a single condition against an item
   */
  private evaluateCondition<T>(
    item: T,
    condition: FilterCondition,
    fieldMapper?: (item: T, field: string) => any
  ): boolean {
    const value = fieldMapper ? fieldMapper(item, condition.field) : (item as any)[condition.field];

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;

      case 'notEquals':
        return value !== condition.value;

      case 'contains':
        return value && value.toString().toLowerCase().includes(condition.value.toString().toLowerCase());

      case 'notContains':
        return !value || !value.toString().toLowerCase().includes(condition.value.toString().toLowerCase());

      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);

      case 'notIn':
        return !Array.isArray(condition.value) || !condition.value.includes(value);

      case 'greaterThan':
        return value > condition.value;

      case 'lessThan':
        return value < condition.value;

      case 'isEmpty':
        return !value || (Array.isArray(value) && value.length === 0);

      case 'isNotEmpty':
        return value && (!Array.isArray(value) || value.length > 0);

      default:
        return false;
    }
  }

  /**
   * Convert filter to JQL string (for display or API calls)
   */
  toJQL(filter: Filter): string {
    const conditions = filter.conditions.map(c => {
      const operator = this.getJQLOperator(c.operator);
      const value = this.formatJQLValue(c);
      return `${c.field} ${operator} ${value}`;
    });

    return conditions.join(` ${filter.logic} `);
  }

  private getJQLOperator(operator: string): string {
    const mapping: Record<string, string> = {
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
}
