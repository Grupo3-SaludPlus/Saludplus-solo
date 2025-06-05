import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Alert {
  id: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  actions: { id: string; label: string }[];
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private alerts = new BehaviorSubject<Alert[]>([
    {
      id: '1',
      message: 'Paciente en UCI - Roberto Silva - Monitoreo constante requerido',
      severity: 'critical',
      actions: [{ id: 'view', label: 'Ver' }],
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      message: 'Stock bajo: Insulina - Quedan 3 unidades',
      severity: 'warning',
      actions: [{ id: 'manage', label: 'Gestionar' }],
      timestamp: new Date(),
      read: false
    },
    {
      id: '3',
      message: 'Mantenimiento programado: Resonancia Magnética - Mañana 08:00',
      severity: 'info',
      actions: [{ id: 'schedule', label: 'Programar' }],
      timestamp: new Date(),
      read: false
    }
  ]);

  constructor() {}

  getAlerts() {
    return this.alerts.asObservable();
  }

  getUnreadCount() {
    return this.alerts.value.filter(alert => !alert.read).length;
  }

  markAsRead(alertId: string) {
    const updatedAlerts = this.alerts.value.map(alert => {
      if (alert.id === alertId) {
        return { ...alert, read: true };
      }
      return alert;
    });
    this.alerts.next(updatedAlerts);
  }

  markAllAsRead() {
    const updatedAlerts = this.alerts.value.map(alert => ({ ...alert, read: true }));
    this.alerts.next(updatedAlerts);
  }
  
  handleAlertAction(alertId: string, actionId: string) {
    console.log(`Action ${actionId} triggered for alert ${alertId}`);
    // Aquí puedes implementar la lógica específica para cada acción
    // por ejemplo, navegar a una página, abrir otro popup, etc.
    
    // Marcar como leída después de la acción
    this.markAsRead(alertId);
  }
  
  addAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) {
    const newAlert: Alert = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...alert
    };
    
    this.alerts.next([newAlert, ...this.alerts.value]);
  }
  
  removeAlert(alertId: string) {
    const updatedAlerts = this.alerts.value.filter(alert => alert.id !== alertId);
    this.alerts.next(updatedAlerts);
  }

  // Método general para mostrar notificaciones
  private show(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    // Puedes implementar esto con una librería de notificaciones como ngx-toastr
    // Por ahora usamos console.log y alert para demostración
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    alert(`${title}\n${message}`);
  }

  // Alias para mantener retrocompatibilidad con las dos versiones usadas
  success(title: string, message: string): void {
    this.show(title, message, 'success');
  }

  showSuccess(title: string, message: string): void {
    this.success(title, message);
  }

  error(title: string, message: string): void {
    this.show(title, message, 'error');
  }

  showError(title: string, message: string): void {
    this.error(title, message);
  }

  info(title: string, message: string): void {
    this.show(title, message, 'info');
  }

  warning(title: string, message: string): void {
    this.show(title, message, 'warning');
  }
}