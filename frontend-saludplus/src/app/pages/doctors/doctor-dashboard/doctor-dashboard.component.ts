import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../../services/auth.service';
import { SharedAppointmentsService, AppointmentBase } from '../../../services/shared-appointments.service';

interface DoctorStats {
  todayTotal: number;
  pendingTotal: number;
  monthlyPatients: number;
  completedRate: number;
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css'
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  todayAppointments: AppointmentBase[] = [];
  upcomingAppointments: AppointmentBase[] = [];
  stats: DoctorStats = {
    todayTotal: 0,
    pendingTotal: 0,
    monthlyPatients: 0,
    completedRate: 0
  };
  
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private appointmentsService: SharedAppointmentsService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.loadDoctorData();
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  private loadDoctorData() {
    this.loadTodayAppointments();
    this.loadUpcomingAppointments();
    this.calculateStats();
  }

  private loadTodayAppointments() {
    this.appointmentsService.getAllAppointments().subscribe((appointments: AppointmentBase[]) => {
      const today = new Date().toISOString().split('T')[0];
      if (this.currentUser) {
        this.todayAppointments = appointments.filter(apt => 
          apt.doctorName === this.currentUser?.name && apt.date === today
        );
        this.calculateStats();
      }
    });
  }

  private loadUpcomingAppointments() {
    this.appointmentsService.getAllAppointments().subscribe((appointments: AppointmentBase[]) => {
      if (this.currentUser) {
        const today = new Date();
        this.upcomingAppointments = appointments.filter(apt => {
          const appointmentDate = new Date(apt.date);
          return apt.doctorName === this.currentUser?.name && 
                 appointmentDate > today &&
                 (apt.status === 'scheduled' || apt.status === 'confirmed');
        });
      }
    });
  }

  private calculateStats() {
    this.stats.todayTotal = this.todayAppointments.length;
    this.stats.pendingTotal = this.todayAppointments.filter(apt => 
      apt.status === 'scheduled' || apt.status === 'confirmed'
    ).length;
    
    // Calcular pacientes del mes actual
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    this.appointmentsService.getAllAppointments().subscribe((appointments: AppointmentBase[]) => {
      if (this.currentUser) {
        const monthlyAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.date);
          return apt.doctorName === this.currentUser?.name &&
                 aptDate.getMonth() === currentMonth &&
                 aptDate.getFullYear() === currentYear;
        });
        
        this.stats.monthlyPatients = new Set(monthlyAppointments.map(apt => apt.patientName)).size;
        
        const completedAppointments = monthlyAppointments.filter(apt => apt.status === 'completed');
        this.stats.completedRate = monthlyAppointments.length > 0 ? 
          Math.round((completedAppointments.length / monthlyAppointments.length) * 100) : 0;
      }
    });
  }

  canStart(appointment: AppointmentBase): boolean {
    return appointment.status === 'confirmed' || appointment.status === 'scheduled';
  }

  canComplete(appointment: AppointmentBase): boolean {
    return appointment.status === 'in-progress';
  }

  startAppointment(id: number) {
    this.appointmentsService.updateAppointment(id, { status: 'in-progress' }).subscribe({
      next: () => {
        this.loadTodayAppointments();
      },
      error: (error) => console.error('Error iniciando cita:', error)
    });
  }

  confirmAppointment(id: number) {
    this.appointmentsService.updateAppointment(id, { status: 'confirmed' }).subscribe({
      next: () => {
        this.loadTodayAppointments();
      },
      error: (error) => console.error('Error confirmando cita:', error)
    });
  }

  completeAppointment(id: number) {
    this.appointmentsService.updateAppointment(id, { status: 'completed' }).subscribe({
      next: () => {
        this.loadTodayAppointments();
      },
      error: (error) => console.error('Error completando cita:', error)
    });
  }

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

  getStatusText(status: string): string {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'confirmed': return 'Confirmada';
      case 'in-progress': return 'En progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'scheduled': return '#ffa500';
      case 'confirmed': return '#28a745';
      case 'in-progress': return '#007bff';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }
}