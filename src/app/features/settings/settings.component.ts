import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  // Préférences d'affichage
  theme = signal<string>('light');
  language = signal<string>('fr');
  density = signal<string>('comfortable');

  // Notifications
  emailNotifications = signal(true);
  pushNotifications = signal(false);
  taskReminders = signal(true);
  weeklyReport = signal(true);

  // Préférences des tâches
  defaultView = signal<string>('list');
  defaultPriority = signal<string>('medium');
  autoArchive = signal(false);

  saveSettings() {
    const settings = {
      theme: this.theme(),
      language: this.language(),
      density: this.density(),
      emailNotifications: this.emailNotifications(),
      pushNotifications: this.pushNotifications(),
      taskReminders: this.taskReminders(),
      weeklyReport: this.weeklyReport(),
      defaultView: this.defaultView(),
      defaultPriority: this.defaultPriority(),
      autoArchive: this.autoArchive()
    };

    localStorage.setItem('app-settings', JSON.stringify(settings));
    alert('Paramètres sauvegardés avec succès!');
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.theme.set(settings.theme || 'light');
      this.language.set(settings.language || 'fr');
      this.density.set(settings.density || 'comfortable');
      this.emailNotifications.set(settings.emailNotifications !== false);
      this.pushNotifications.set(settings.pushNotifications || false);
      this.taskReminders.set(settings.taskReminders !== false);
      this.weeklyReport.set(settings.weeklyReport !== false);
      this.defaultView.set(settings.defaultView || 'list');
      this.defaultPriority.set(settings.defaultPriority || 'medium');
      this.autoArchive.set(settings.autoArchive || false);
    }
  }

  ngOnInit() {
    this.loadSettings();
  }
}
