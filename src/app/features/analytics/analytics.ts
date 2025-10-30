import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Composant Analytics - Redirige vers la page de statistiques
 * Ce composant existe pour satisfaire le lien de navigation "Analytics"
 * et redirige automatiquement vers /stats qui contient les analytics existants
 */
@Component({
  selector: 'app-analytics',
  standalone: true,
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <p>Redirection vers les statistiques...</p>
    </div>
  `,
  styles: [`
    div {
      color: var(--text-color);
      font-size: 1.2rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsComponent implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    // Redirection automatique vers la page de statistiques
    this.router.navigate(['/stats']);
  }
}
