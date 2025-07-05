import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../services/api.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  currentUser: User | null = null;
  
  stats = {
    todayTotal: 0,
    todayCompleted: 0,
    todayPending: 0,
    weekTotal: 0,
    monthTotal: 0,
    pendingTotal: 0,        // NECESARIO para el HTML
    monthlyPatients: 0,     // NECESARIO para el HTML
    completedRate: 0        // NECESARIO para el HTML
  };

  todayAppointments: any[] = [];
  upcomingAppointments: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Suscribirse al usuario actual
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
    
    // Cargar datos del dashboard
    this.loadDashboardData();
  }

  // MÉTODO NECESARIO para {{ getCurrentDate() }}
  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // MÉTODO NECESARIO para [class]="getStatusClass(appointment.status)"
  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'confirmed': return 'status-confirmed';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  // MÉTODO NECESARIO para @if (canStart(appointment))
  canStart(appointment: any): boolean {
    return appointment.status === 'confirmed' || appointment.status === 'scheduled';
  }

  // MÉTODO NECESARIO para @if (canComplete(appointment))
  canComplete(appointment: any): boolean {
    return appointment.status === 'in-progress';
  }

  // MÉTODO NECESARIO para (click)="startAppointment(appointment)"
  startAppointment(appointment: any): void {
    console.log('Iniciando cita:', appointment);
    // Aquí puedes agregar la lógica para cambiar el estado de la cita
    appointment.status = 'in-progress';
  }

  // MÉTODO NECESARIO para (click)="completeAppointment(appointment)"
  completeAppointment(appointment: any): void {
    console.log('Completando cita:', appointment);
    // Aquí puedes agregar la lógica para completar la cita
    appointment.status = 'completed';
  }

  // MÉTODO NECESARIO para {{getStatusText(appointment.status)}}
  getStatusText(status: string): string {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'confirmed': return 'Confirmada';
      case 'in-progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }

  private loadDashboardData(): void {
    // Cargar datos de ejemplo o conectar con servicios reales
    this.loadStats();
    this.loadTodayAppointments();
    this.loadUpcomingAppointments();
  }

  private loadStats(): void {
    // Datos de ejemplo - aquí puedes conectar con tu servicio
    this.stats = {
      todayTotal: 8,
      todayCompleted: 3,
      todayPending: 5,
      weekTotal: 32,
      monthTotal: 127,
      pendingTotal: 12,      // Para stats.pendingTotal
      monthlyPatients: 85,   // Para stats.monthlyPatients
      completedRate: 92      // Para stats.completedRate
    };
  }

  private loadTodayAppointments(): void {
    // Datos de ejemplo - aquí puedes conectar con tu servicio
    this.todayAppointments = [
      {
        id: 1,
        time: '09:00',
        patient_name: 'Juan Pérez',
        reason: 'Consulta general',
        status: 'confirmed'
      },
      {
        id: 2,
        time: '10:30',
        patient_name: 'María García',
        reason: 'Control médico',
        status: 'scheduled'
      }
    ];
  }

  private loadUpcomingAppointments(): void {
    // Datos de ejemplo - aquí puedes conectar con tu servicio
    this.upcomingAppointments = [
      {
        id: 3,
        date: '2025-07-04',
        time: '14:00',
        patient_name: 'Carlos López',
        status: 'scheduled'
      }
    ];
  }
}