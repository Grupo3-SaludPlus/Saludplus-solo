import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PopupComponent {
  @Input() title: string = '';
  @Input() show: boolean = false;
  @Input() type: 'alert' | 'form' | 'confirmation' = 'alert';
  @Input() alerts: any[] = [];
  
  @Output() close = new EventEmitter<void>();
  @Output() action = new EventEmitter<any>();
  
  closePopup() {
    this.close.emit();
  }
  
  handleAction(alertId: string, action: string) {
    this.action.emit({ alertId, action });
  }
  
  handleMarkAllAsRead() {
    this.action.emit({ action: 'markAllAsRead' });
  }
  
  handleRefresh() {
    this.action.emit({ action: 'refresh' });
  }
  
  getAlertTypeIcon(type: string): string {
    switch(type) {
      case 'critical': return 'fa-heartbeat';
      case 'warning': return 'fa-pills';
      case 'info': return 'fa-calendar-check';
      default: return 'fa-exclamation-triangle';
    }
  }
}