import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { ButtonComponent } from '../button/button.component';
import { WidgetConfig, WidgetType } from '../../../core/services/dashboard-layout.service';

interface WidgetSettings {
  [key: string]: any;
}

@Component({
  selector: 'app-widget-settings-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ButtonComponent],
  template: `
    <div class="settings-overlay" (click)="onClose()">
      <div class="settings-dialog" (click)="$event.stopPropagation()">
        <div class="settings-header">
          <h2>{{ widget.title }} - Paramètres</h2>
          <button class="close-btn" (click)="onClose()">
            <jira-icon name="close" [size]="20" />
          </button>
        </div>

        <div class="settings-content">
          <!-- General Settings -->
          <div class="settings-section">
            <h3>Général</h3>
            <div class="form-group">
              <label>Titre du widget</label>
              <input
                type="text"
                class="form-input"
                [(ngModel)]="settings['title']"
                placeholder="Titre personnalisé"
              />
            </div>
          </div>

          <!-- Widget-specific Settings -->
          <div class="settings-section" *ngIf="hasSpecificSettings()">
            <h3>Configuration spécifique</h3>

            <!-- My Issues Settings -->
            <div *ngIf="widget.type === 'my-issues'">
              <div class="form-group">
                <label>Nombre d'issues à afficher</label>
                <input
                  type="number"
                  class="form-input"
                  [(ngModel)]="settings['limit']"
                  min="5"
                  max="50"
                />
              </div>
              <div class="form-group">
                <label>Filtrer par statut</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="settings['showTodo']" />
                    <span>To Do</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="settings['showInProgress']" />
                    <span>In Progress</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="settings['showReview']" />
                    <span>In Review</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Recent Activity Settings -->
            <div *ngIf="widget.type === 'recent-activity'">
              <div class="form-group">
                <label>Nombre d'activités à afficher</label>
                <input
                  type="number"
                  class="form-input"
                  [(ngModel)]="settings['limit']"
                  min="5"
                  max="30"
                />
              </div>
              <div class="form-group">
                <label>Types d'activité</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="settings['showCreated']" />
                    <span>Issues créées</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="settings['showUpdated']" />
                    <span>Issues mises à jour</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="settings['showCommented']" />
                    <span>Commentaires</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Velocity Chart Settings -->
            <div *ngIf="widget.type === 'velocity-chart'">
              <div class="form-group">
                <label>Nombre de sprints</label>
                <input
                  type="number"
                  class="form-input"
                  [(ngModel)]="settings['sprints']"
                  min="3"
                  max="12"
                />
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="settings['showAverage']" />
                  <span>Afficher la moyenne</span>
                </label>
              </div>
            </div>

            <!-- Burndown Chart Settings -->
            <div *ngIf="widget.type === 'burndown-chart'">
              <div class="form-group">
                <label>Sprint</label>
                <select class="form-input" [(ngModel)]="settings['sprintId']">
                  <option value="">Sprint actif</option>
                  <option value="current">Sprint en cours</option>
                  <option value="next">Prochain sprint</option>
                </select>
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="settings['showIdealLine']" />
                  <span>Afficher la ligne idéale</span>
                </label>
              </div>
            </div>

            <!-- Issue Distribution Settings -->
            <div *ngIf="widget.type === 'issue-distribution'">
              <div class="form-group">
                <label>Grouper par</label>
                <select class="form-input" [(ngModel)]="settings['groupBy']">
                  <option value="status">Statut</option>
                  <option value="priority">Priorité</option>
                  <option value="type">Type</option>
                </select>
              </div>
              <div class="form-group">
                <label>Type de graphique</label>
                <select class="form-input" [(ngModel)]="settings['chartType']">
                  <option value="doughnut">Donut</option>
                  <option value="pie">Camembert</option>
                  <option value="bar">Barres</option>
                </select>
              </div>
            </div>

            <!-- Overview Stats Settings -->
            <div *ngIf="widget.type === 'overview-stats'">
              <div class="form-group">
                <label>Période de comparaison</label>
                <select class="form-input" [(ngModel)]="settings['comparePeriod']">
                  <option value="week">Semaine dernière</option>
                  <option value="month">Mois dernier</option>
                  <option value="quarter">Trimestre dernier</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Refresh Settings -->
          <div class="settings-section">
            <h3>Actualisation</h3>
            <div class="form-group">
              <label>Actualisation automatique</label>
              <select class="form-input" [(ngModel)]="settings['autoRefresh']">
                <option value="0">Désactivée</option>
                <option value="30">Toutes les 30 secondes</option>
                <option value="60">Toutes les minutes</option>
                <option value="300">Toutes les 5 minutes</option>
                <option value="600">Toutes les 10 minutes</option>
              </select>
            </div>
          </div>
        </div>

        <div class="settings-footer">
          <jira-button variant="secondary" (clicked)="onClose()">
            Annuler
          </jira-button>
          <jira-button variant="primary" (clicked)="onSave()">
            Enregistrer
          </jira-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(9, 30, 66, 0.54);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .settings-dialog {
      background: var(--jira-neutral-0);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .settings-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-xl);
      border-bottom: 1px solid var(--jira-neutral-200);
    }

    h2 {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      margin: 0;
    }

    h3 {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--jira-neutral-1000);
      margin: 0 0 var(--spacing-md) 0;
    }

    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      color: var(--jira-neutral-700);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--jira-neutral-100);
        color: var(--jira-neutral-1000);
      }
    }

    .settings-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-xl);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .settings-section {
      padding: var(--spacing-lg);
      background: var(--jira-neutral-50);
      border-radius: var(--radius-md);
      border: 1px solid var(--jira-neutral-200);
    }

    .form-group {
      margin-bottom: var(--spacing-md);

      &:last-child {
        margin-bottom: 0;
      }
    }

    label {
      display: block;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--jira-neutral-800);
      margin-bottom: var(--spacing-xs);
    }

    .form-input {
      width: 100%;
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
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-sm);
      color: var(--jira-neutral-800);
      cursor: pointer;
      margin-bottom: 0;

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      span {
        user-select: none;
      }
    }

    .settings-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--spacing-md);
      padding: var(--spacing-lg) var(--spacing-xl);
      border-top: 1px solid var(--jira-neutral-200);
    }

    @media (max-width: 768px) {
      .settings-dialog {
        width: 95%;
        max-height: 95vh;
      }
    }
  `]
})
export class WidgetSettingsDialogComponent implements OnInit {
  @Input() widget!: WidgetConfig;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<WidgetSettings>();

  settings: WidgetSettings = {};

  ngOnInit(): void {
    // Initialize settings with widget's current settings
    this.settings = {
      title: this.widget.title,
      ...this.getDefaultSettings(this.widget.type),
      ...this.widget.settings
    };
  }

  hasSpecificSettings(): boolean {
    const widgetsWithSettings: WidgetType[] = [
      'my-issues',
      'recent-activity',
      'velocity-chart',
      'burndown-chart',
      'issue-distribution',
      'overview-stats'
    ];
    return widgetsWithSettings.includes(this.widget.type);
  }

  getDefaultSettings(type: WidgetType): WidgetSettings {
    const defaults: Record<WidgetType, WidgetSettings> = {
      'my-issues': {
        limit: 10,
        showTodo: true,
        showInProgress: true,
        showReview: true
      },
      'recent-activity': {
        limit: 10,
        showCreated: true,
        showUpdated: true,
        showCommented: true
      },
      'velocity-chart': {
        sprints: 6,
        showAverage: true
      },
      'burndown-chart': {
        sprintId: '',
        showIdealLine: true
      },
      'issue-distribution': {
        groupBy: 'status',
        chartType: 'doughnut'
      },
      'overview-stats': {
        comparePeriod: 'week'
      },
      'filter-results': {},
      'created-vs-resolved': {},
      'cumulative-flow': {},
      'epic-progress': {},
      'resolution-time': {},
      'team-workload': {}
    };

    return {
      autoRefresh: 0,
      ...defaults[type]
    };
  }

  onSave(): void {
    this.save.emit(this.settings);
    this.onClose();
  }

  onClose(): void {
    this.close.emit();
  }
}
