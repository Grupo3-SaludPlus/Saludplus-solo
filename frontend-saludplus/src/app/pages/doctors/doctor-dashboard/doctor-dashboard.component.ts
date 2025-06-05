import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedAppointmentsService } from '../../../services/shared-appointments.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit, OnDestroy {
  currentUser: any;
  todayAppointments: any[] = [];
  upcomingAppointments: any[] = [];
  stats = {
    todayTotal: 0,
    pendingTotal: 0,
    monthlyPatients: 0,
    completedRate: 0
  };
  
  private userSubscription?: Subscription;
  private appointmentsSubscription?: Subscription;
  
  constructor(
    private authService: AuthService,
    private appointmentsService: SharedAppointmentsService
  ) {}
  
  ngOnInit() {
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadAppointments();
      }
    });
  }
  
  loadAppointments() {
    this.appointmentsSubscription = this.appointmentsService.getAllAppointments()
      .subscribe(appointments => {
        if (this.currentUser?.id) {
          const doctorId = Number(this.currentUser.id);
          const allDoctorAppointments = appointments.filter(a => a.doctorId === doctorId);
          
          // Citas de hoy
          const today = new Date().toISOString().split('T')[0];
          this.todayAppointments = allDoctorAppointments
            .filter(a => a.date === today)
            .sort((a, b) => a.time.localeCompare(b.time));
          
          // Próximas citas (futuras, incluyendo hoy)
          this.upcomingAppointments = allDoctorAppointments
            .filter(a => 
              (a.date > today || (a.date === today && this.isTimeInFuture(a.time))) &&
              (a.status === 'scheduled' || a.status === 'confirmed')
            )
            .sort((a, b) => {
              if (a.date !== b.date) {
                return a.date.localeCompare(b.date);
              }
              return a.time.localeCompare(b.time);
            })
            .slice(0, 5); // Limitar a 5 citas próximas
          
          console.log('Citas próximas cargadas:', this.upcomingAppointments.length);
          
          // Calcular estadísticas
          this.calculateStats(allDoctorAppointments);
        }
      });
  }
  
  isTimeInFuture(time: string): boolean {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    return (now.getHours() < hours) || (now.getHours() === hours && now.getMinutes() < minutes);
  }
  
  calculateStats(appointments: any[]) {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Citas de hoy
    this.stats.todayTotal = appointments.filter(a => a.date === today).length;
    
    // Citas pendientes (scheduled/confirmed)
    this.stats.pendingTotal = appointments.filter(a => 
      (a.status === 'scheduled' || a.status === 'confirmed') && 
      (a.date >= today)
    ).length;
    
    // Pacientes únicos este mes
    const monthlyAppointments = appointments.filter(a => {
      const appointmentDate = new Date(a.date);
      return appointmentDate.getMonth() === currentMonth && 
             appointmentDate.getFullYear() === currentYear;
    });
    
    const uniquePatients = new Set(monthlyAppointments.map(a => a.patientId));
    this.stats.monthlyPatients = uniquePatients.size;
    
    // Tasa de completitud (citas completadas vs total)
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const totalPastAppointments = appointments.filter(a => 
      a.date < today || (a.date === today && !this.isTimeInFuture(a.time))
    ).length;
    
    this.stats.completedRate = totalPastAppointments > 0 
      ? Math.round((completedAppointments / totalPastAppointments) * 100) 
      : 100;
  }
  
  getCurrentDate(): string {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('es-ES', options);
  }
  
  getStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'scheduled': 'Agendada',
      'confirmed': 'Confirmada',
      'in_progress': 'En Progreso',
      'completed': 'Completada',
      'cancelled': 'Cancelada',
      'no_show': 'No Asistió'
    };
    return statusMap[status] || status;
  }
  
  getStatusClass(status: string): string {
    return `status-${status.replace('_', '-')}`;
  }
  
  canStart(appointment: any): boolean {
    return appointment.status === 'confirmed';
  }
  
  canComplete(appointment: any): boolean {
    return appointment.status === 'in_progress';
  }
  
  startAppointment(id: number) {
    const updatedAppointment = this.appointmentsService.updateAppointment({ id, status: 'scheduled' });
    if (updatedAppointment) {
      this.loadAppointments();
    }
  }
  
  completeAppointment(id: number) {
    const updatedAppointment = this.appointmentsService.updateAppointment({ id, status: 'completed' });
    if (updatedAppointment) {
      this.loadAppointments();
    }
  }
  
  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.appointmentsSubscription) {
      this.appointmentsSubscription.unsubscribe();
    }
  }
}