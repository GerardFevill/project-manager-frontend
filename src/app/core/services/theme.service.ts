import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'jira-theme';

  // Signal for current theme
  currentTheme = signal<Theme>(this.getStoredTheme());

  constructor() {
    // Apply theme on initialization
    this.applyTheme(this.currentTheme());

    // Auto-apply theme when it changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.storeTheme(theme);
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  /**
   * Get the currently active theme
   */
  getTheme(): Theme {
    return this.currentTheme();
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode(): boolean {
    return this.currentTheme() === 'dark';
  }

  /**
   * Apply the theme to the document
   */
  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;

    if (theme === 'dark') {
      htmlElement.setAttribute('data-theme', 'dark');
    } else {
      htmlElement.removeAttribute('data-theme');
    }
  }

  /**
   * Get theme from localStorage or detect system preference
   */
  private getStoredTheme(): Theme {
    // Check localStorage first
    const stored = localStorage.getItem(this.THEME_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    // Fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to light
    return 'light';
  }

  /**
   * Store theme preference in localStorage
   */
  private storeTheme(theme: Theme): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }
}
