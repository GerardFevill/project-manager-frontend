# Project Manager Portal - Documentation Claude

## 📋 Vue d'ensemble du projet

Application Angular de gestion de projets et tâches avec authentification backend, thème sombre GitHub et architecture modulaire.

## 🏗️ Architecture

### Structure des dossiers

```
src/app/
├── core/
│   ├── models/          # Interfaces TypeScript (Task, TaskFilterDto, CreateTaskDto)
│   ├── services/        # Services (TaskService, NotificationService, UserService)
│   └── constants/       # Constantes (messages, config)
├── shared/
│   └── components/      # Composants réutilisables
│       ├── confirm-dialog/        # Dialogue de confirmation
│       └── create-task-dialog/    # Formulaire de création/édition
├── features/
│   └── tasks/
│       └── task-list/   # Composant de gestion des tâches
│           ├── task-list.ts      # Logique du composant
│           ├── task-list.html    # Template (tableau Material)
│           └── task-list.scss    # Styles
├── app.ts               # Composant racine
├── app.html            # Template racine
├── app.scss            # Styles racine
└── styles.scss         # Styles globaux
```

## 🎨 Thème

### Mode Sombre GitHub Dark
```scss
--bg-color: #010409        // Fond principal noir profond
--card-bg: #0d1117         // Fond des cartes
--text-color: #e6edf3      // Texte principal
--text-secondary: #7d8590  // Texte secondaire
--border-color: #30363d    // Bordures
--hover-bg: #161b22        // Fond au survol
```

### Mode Clair
```scss
--bg-color: #ffffff
--text-color: oklch(19.37% 0.006 300.98)
--text-secondary: oklch(36.98% 0.014 302.71)
--border-color: oklch(70.9% 0.015 304.04)
```

## 🔧 Composant TaskList

### Fonctionnalités principales

1. **Gestion CRUD des tâches**
   - Création avec formulaire (titre, description, priorité, date)
   - Lecture avec filtres (status, priorité, root/subtasks)
   - Mise à jour (toggle completed)
   - Suppression (avec confirmation)

2. **Hiérarchie de tâches**
   - Support des sous-tâches (parentId)
   - Niveaux multiples (level)
   - Navigation parent/enfants

3. **Filtres avancés**
   - Par statut (all, active, completed)
   - Par priorité (low, medium, high, urgent)
   - Root tasks uniquement ou avec sous-tâches

### Services

#### TaskService (API REST)

```typescript
// Méthodes disponibles
findAll(filters: TaskFilterDto): Observable<Task[]>
create(task: CreateTaskDto): Observable<Task>
toggle(id: string): Observable<Task>
remove(id: string): Observable<void>
```

#### NotificationService (Toasters)

```typescript
// Service centralisé pour les notifications
success(message: string, duration?: number, action?: string): void
error(message: string, duration?: number, action?: string): void
warning(message: string, duration?: number, action?: string): void
info(message: string, duration?: number, action?: string): void

// Configuration par défaut:
// - Position: haut à droite
// - Durées: info(1s), success(2s), warning/error(3s)
// - Classes CSS: snackbar-success, snackbar-error, snackbar-warning, snackbar-info
```

### Interfaces principales

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  level: number;
  dueDate?: Date;
  createdAt: Date;
  parentId?: string;
}

interface CreateTaskDto {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  parentId?: string;
}

interface TaskFilterDto {
  status?: 'all' | 'active' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  parentId?: string;
  onlyRoot?: boolean;
}
```

## 🎯 Configuration Angular

### angular.json - Génération de composants

```json
"schematics": {
  "@schematics/angular:component": {
    "style": "scss",
    "inlineTemplate": false,
    "inlineStyle": false,
    "skipTests": false
  }
}
```

Tous les nouveaux composants auront automatiquement 3 fichiers séparés (.ts, .html, .scss).

## 🌓 Mode Sombre

### Activation
Le mode sombre est géré via la classe `.dark-mode` sur l'élément `<html>`.

```typescript
// Dans app.ts
effect(() => {
  if (this.isDarkMode()) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
});
```

### Persistance
Le mode est sauvegardé dans `localStorage` et détecte les préférences système au premier chargement.

## 📦 Dépendances principales

- **Angular** 19+ (standalone components, signals)
- **Angular Material** (UI components, thèmes)
- **RxJS** (gestion asynchrone)
- **SCSS** (styles)

## 🚀 Commandes utiles

```bash
# Générer un nouveau composant
npx ng generate component features/mon-composant --skip-tests

# Lancer le serveur de développement
ng serve

# Build de production
ng build

# Tests
ng test
```

## 📝 Conventions de code

### Composants
- Utiliser des **standalone components**
- Utiliser les **signals** pour la gestion d'état
- Séparer template/styles en fichiers distincts
- Nom: `nom.component.ts` ou `nom.ts`

### Styles
- Utiliser les **variables CSS** du thème global
- Préférer SCSS avec nesting
- Classes BEM ou descriptives
- Responsive design

### Services
- Injection via `inject()`
- Gestion d'erreurs avec try/catch ou error callbacks
- Typage strict avec TypeScript

## 🔐 Backend

Le projet communique avec une API REST backend (non incluse dans ce frontend).

### Endpoints attendus
```
GET    /tasks?status=...&priority=...      # Liste des tâches
POST   /tasks                               # Créer une tâche
PATCH  /tasks/:id/toggle                    # Toggle completed
DELETE /tasks/:id                           # Supprimer une tâche
```

## 🎨 Angular Material

Configuration avec thème personnalisé violet:
```scss
@use '@angular/material' as mat;

$light-theme: mat.define-theme((
  color: (theme-type: light, primary: mat.$violet-palette)
));

$dark-theme: mat.define-theme((
  color: (theme-type: dark, primary: mat.$violet-palette)
));
```

## 🧩 Composants Partagés

### ConfirmDialogComponent

Dialogue de confirmation réutilisable avec Material Design.

```typescript
// Utilisation
const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  data: {
    title: 'Confirmer la suppression',
    message: 'Êtes-vous sûr?',
    confirmText: 'Supprimer',
    cancelText: 'Annuler'
  }
});

dialogRef.afterClosed().subscribe(result => {
  if (result) {
    // Action confirmée
  }
});
```

### CreateTaskDialogComponent

Dialogue pour créer ou modifier une tâche.

```typescript
// Création
const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
  width: '500px'
});

// Édition (passe les données existantes)
const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
  width: '500px',
  data: task // Task existante
});

dialogRef.afterClosed().subscribe((result: CreateTaskDto) => {
  if (result) {
    // result contient les données du formulaire
  }
});
```

## 📦 Constantes

### TASK_MESSAGES

Centralise tous les messages de notification pour les tâches.

```typescript
import { TASK_MESSAGES } from '@core/constants/messages';

// Messages disponibles
TASK_MESSAGES.LOADING              // 'Chargement des tâches...'
TASK_MESSAGES.LOADED(count)        // 'X tâche(s) chargée(s)'
TASK_MESSAGES.CREATED              // '✅ Tâche créée avec succès'
TASK_MESSAGES.UPDATED              // '✏️ Tâche modifiée avec succès'
TASK_MESSAGES.DELETED              // '🗑️ Tâche supprimée avec succès'
TASK_MESSAGES.DUPLICATED           // '✅ Tâche dupliquée avec succès'
TASK_MESSAGES.CONFIRM_DELETE       // Objet pour dialogue de confirmation
```

## 📌 Notes importantes

1. **Structure modulaire**: Composants features/ + shared/
2. **Services centralisés**: Dans `core/services/`
3. **Constantes**: Messages et config dans `core/constants/`
3. **Models partagés**: Dans `core/models/`
4. **Thème adaptatif**: Toute l'UI s'adapte au mode dark/light
5. **Composants standalone**: Pas de NgModule, imports directs

## 🔄 Workflow de développement

1. Créer le modèle dans `core/models/`
2. Créer le service dans `core/services/`
3. Générer le composant dans `features/`
4. Implémenter la logique avec signals
5. Styler avec variables CSS du thème
6. Tester et intégrer

---

**Dernière mise à jour**: 2025-10-26
**Version Angular**: 19+
**Auteur**: Généré avec Claude Code
