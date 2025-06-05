import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { AppointmentsService, MedicalAppointment } from '../../../services/appointments.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  todayAppointments: MedicalAppointment[] = [];
  stats = {
    todayTotal: 0,
    pendingTotal: 0,
    monthlyPatients: 0,
    completedRate: 0
  };
  
  recentActivity = [];
  upcomingAppointments: MedicalAppointment[] = [];
  private appointmentSubscription: Subscription | undefined;
  
  constructor(
    private authService: AuthService,
    private appointmentsService: AppointmentsService
  ) {}
  
  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadDashboardData();
      }
    });
  }
  
  ngOnDestroy() {
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe();
    }
  }
  
  loadDashboardData() {
    this.appointmentSubscription = this.appointmentsService.getAllAppointments()
      .subscribe(appointments => {
        if (this.currentUser?.id) {
          const doctorId = Number(this.currentUser.id);
          const doctorAppointments = appointments.filter(a => a.doctorId === doctorId);
          
          // Citas de hoy
          const today = new Date().toISOString().split('T')[0];
          this.todayAppointments = doctorAppointments.filter(apt => apt.date === today)
            .sort((a, b) => a.time.localeCompare(b.time));
          
          // Próximas citas (futuras, ordenadas por fecha)
          this.upcomingAppointments = doctorAppointments.filter(apt => apt.date >= today && apt.status === 'scheduled')
            .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
            .slice(0, 5); // Solo mostrar las próximas 5
          
          // Estadísticas
          this.calculateStats(doctorAppointments, today);
        }
      });
  }
  
  calculateStats(appointments: MedicalAppointment[], today: string) {
    // Citas de hoy
    this.stats.todayTotal = appointments.filter(apt => apt.date === today).length;
    
    // Citas pendientes (agendadas o en progreso)
    this.stats.pendingTotal = appointments.filter(apt => 
      apt.status === 'scheduled' || apt.status === 'in-progress').length;
      
    // Pacientes este mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const patientIdsThisMonth = new Set();
    
    appointments.forEach(apt => {
      const aptDate = new Date(apt.date);
      if (aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear) {
        patientIdsThisMonth.add(apt.patientId);
      }
    });
    
    this.stats.monthlyPatients = patientIdsThisMonth.size;
    
    // Tasa de completitud (citas completadas vs canceladas)
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const total = appointments.length;
    this.stats.completedRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  getCurrentDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    // Formatea la fecha en español con primera letra en mayúscula
    let formattedDate = today.toLocaleDateString('es-ES', options);
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    return formattedDate; // Por ejemplo: "Martes, 4 de junio de 2024"
  }

  // Verificar si una cita puede iniciarse (solo si está agendada)
  canStart(appointment: MedicalAppointment): boolean {
    return appointment.status === 'scheduled';
  }

  // Verificar si una cita puede completarse (solo si está en progreso)
  canComplete(appointment: MedicalAppointment): boolean {
    return appointment.status === 'in-progress';
  }

  // Verificar si una cita puede cancelarse
  canCancel(appointment: MedicalAppointment): boolean {
    return appointment.status === 'scheduled' || appointment.status === 'in-progress';
  }

  // Iniciar una consulta médica
  startAppointment(appointmentId: number): void {
    this.appointmentsService.updateAppointmentStatus(appointmentId, 'in-progress');
    // Actualizar la vista
    this.loadDashboardData();
  }

  // Completar una consulta médica
  completeAppointment(appointmentId: number): void {
    this.appointmentsService.updateAppointmentStatus(appointmentId, 'completed');
    // Actualizar la vista
    this.loadDashboardData();
  }

  // Método auxiliar para obtener la clase CSS según el estado
  getStatusClass(status: string): string {
    return `status-${status}`;
  }
}