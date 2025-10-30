import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

interface FAQItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpComponent {
  faqs: FAQItem[] = [
    {
      question: 'Comment créer une nouvelle tâche ?',
      answer: 'Cliquez sur le bouton "New Task" en haut de la liste des tâches. Remplissez les informations requises et cliquez sur "Créer".'
    },
    {
      question: 'Comment convertir une tâche en projet ?',
      answer: 'Ouvrez les détails de la tâche, cliquez sur le menu "Actions" (trois points) et sélectionnez "Convertir en projet". Confirmez l\'action dans la boîte de dialogue.'
    },
    {
      question: 'Quelle est la différence entre les types de tâches ?',
      answer: 'Les tâches simples sont des unités de travail de base. Les projets peuvent contenir plusieurs tâches. Les epics regroupent plusieurs tâches liées. Les jalons marquent des étapes importantes sans sous-tâches.'
    },
    {
      question: 'Comment filtrer les tâches ?',
      answer: 'Utilisez les filtres en haut de la liste : sélectionnez les statuts, priorités ou types que vous souhaitez afficher. Vous pouvez aussi cocher "Tâches racines uniquement".'
    },
    {
      question: 'Comment créer une sous-tâche ?',
      answer: 'Dans le formulaire de création de tâche, sélectionnez un parent dans le champ "Tâche parent". La nouvelle tâche sera automatiquement liée.'
    },
    {
      question: 'Que signifient les différents statuts ?',
      answer: 'Brouillon: tâche en préparation. Active: en cours de réalisation. Terminée: travail accompli. Bloquée: obstacle empêchant la progression. Récurrente: tâche se répétant. Archivée: tâche historisée.'
    },
    {
      question: 'Comment archiver une tâche ?',
      answer: 'Ouvrez les détails de la tâche, cliquez sur le menu "Actions" et sélectionnez "Archiver". Les tâches archivées n\'apparaissent plus dans la liste principale.'
    },
    {
      question: 'Puis-je voir les statistiques de mes tâches ?',
      answer: 'Oui! Accédez à la page "Statistiques" via le menu de navigation pour voir la répartition par type, statut, priorité et d\'autres métriques.'
    },
    {
      question: 'Comment fonctionne le calendrier ?',
      answer: 'Le calendrier affiche toutes vos tâches selon leur date d\'échéance. Cliquez sur une tâche dans le calendrier pour voir ses détails.'
    },
    {
      question: 'Où puis-je modifier mes préférences ?',
      answer: 'Rendez-vous dans la page "Paramètres" pour personnaliser l\'apparence, les notifications et les préférences des tâches.'
    }
  ];

  quickLinks = [
    { icon: 'task', label: 'Voir mes tâches', route: '/tasks' },
    { icon: 'bar_chart', label: 'Statistiques', route: '/stats' },
    { icon: 'calendar_today', label: 'Calendrier', route: '/calendar' },
    { icon: 'settings', label: 'Paramètres', route: '/settings' }
  ];
}
