import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly defaultConfig: MatSnackBarConfig = {
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  constructor(private snackBar: MatSnackBar) {}

  private show(message: string, type: NotificationType, duration: number = 2000, action: string = '') {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration,
      panelClass: `snackbar-${type}`
    });
  }

  success(message: string, duration: number = 2000, action: string = 'OK') {
    this.show(message, 'success', duration, action);
  }

  error(message: string, duration: number = 3000, action: string = 'Fermer') {
    this.show(message, 'error', duration, action);
  }

  warning(message: string, duration: number = 3000, action: string = 'Fermer') {
    this.show(message, 'warning', duration, action);
  }

  info(message: string, duration: number = 1000, action: string = '') {
    this.show(message, 'info', duration, action);
  }
}
