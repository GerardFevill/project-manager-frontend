/**
 * 🏷️ ENUM - TYPE DE TÂCHE
 *
 * Définit les différents types de tâches dans le système fractal
 */
export enum TaskType {
  /**
   * Tâche simple - unité de travail de base
   * Peut avoir 0-3 enfants maximum
   */
  TASK = 'task',

  /**
   * Projet - conteneur de tâches et epics
   * Peut avoir un nombre illimité d'enfants
   * Généralement au niveau 0 (racine)
   */
  PROJECT = 'project',

  /**
   * Epic - regroupement intermédiaire de tâches
   * Entre task et project en termes de complexité
   * Peut avoir plusieurs tâches enfants
   */
  EPIC = 'epic',

  /**
   * Milestone - jalon/étape importante
   * Ne peut pas avoir d'enfants
   * Toujours lié à une date d'échéance
   */
  MILESTONE = 'milestone',
}
