export const TASK_MESSAGES = {
  LOADING: 'Chargement des tâches...',
  LOADED: (count: number) => `${count} tâche(s) chargée(s)`,
  LOAD_ERROR: 'Erreur lors du chargement des tâches',

  CREATING: 'Création de la tâche...',
  CREATED: '✅ Tâche créée avec succès',
  CREATE_ERROR: '❌ Échec de la création de la tâche',

  UPDATING: 'Modification en cours...',
  UPDATED: '✏️ Tâche modifiée avec succès',
  UPDATE_ERROR: '❌ Erreur lors de la modification',

  DELETING: 'Suppression en cours...',
  DELETED: '🗑️ Tâche supprimée avec succès',
  DELETE_ERROR: '❌ Échec de la suppression',

  DUPLICATING: 'Duplication en cours...',
  DUPLICATED: '✅ Tâche dupliquée avec succès',
  DUPLICATE_ERROR: '❌ Échec de la duplication',

  VIEWING: (title: string) => `Viewing task: ${title}`,

  CONFIRM_DELETE: {
    title: 'Confirmer la suppression',
    message: 'Êtes-vous sûr de vouloir supprimer cette tâche et toutes ses sous-tâches?',
    confirmText: 'Supprimer',
    cancelText: 'Annuler'
  }
};
