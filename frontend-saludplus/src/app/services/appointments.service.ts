import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService, Appointment } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadAppointments();
  }

  // **CARGAR CITAS**
  loadAppointments(): void {
    this.apiService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointmentsSubject.next(appointments);
      },
      error: (error) => {
        console.error('Error cargando citas:', error);
      }
    });
  }

  // **OBTENER CITAS**
  getAllAppointments(): Observable<Appointment[]> {
    return this.appointments$;
  }

  getAppointment(id: number): Observable<Appointment> {
    return this.apiService.getAppointment(id);
  }

  getPatientAppointments(patientId: number): Observable<Appointment[]> {
    return this.appointments$.pipe(
      map(appointments => appointments.filter(apt => apt.patient_id === patientId))
    );
  }

  getDoctorAppointments(doctorId: number): Observable<Appointment[]> {
    return this.appointments$.pipe(
      map(appointments => appointments.filter(apt => apt.doctor_id === doctorId))
    );
  }

  getTodayAppointments(): Observable<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments$.pipe(
      map(appointments => appointments.filter(apt => apt.date === today))
    );
  }

  getUpcomingAppointments(): Observable<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments$.pipe(
      map(appointments => appointments.filter(apt => 
        apt.date >= today && (apt.status === 'scheduled' || apt.status === 'confirmed')
      ))
    );
  }

  // **CREAR CITA**
  createAppointment(appointmentData: Partial<Appointment>): Observable<Appointment> {
    return this.apiService.createAppointment(appointmentData).pipe(
      tap(() => this.loadAppointments())
    );
  }

  // **ACTUALIZAR CITA**
  updateAppointment(id: number, appointmentData: Partial<Appointment>): Observable<Appointment> {
    return this.apiService.updateAppointment(id, appointmentData).pipe(
      tap(() => this.loadAppointments())
    );
  }

  // **OPERACIONES ESPECÍFICAS**
  confirmAppointment(id: number): Observable<Appointment> {
    return this.updateAppointment(id, { status: 'confirmed' });
  }

  cancelAppointment(id: number, reason?: string): Observable<Appointment> {
    const updateData: Partial<Appointment> = { 
      status: 'cancelled'
    };
    
    if (reason) {
      updateData.notes = reason;
    }
    
    return this.updateAppointment(id, updateData);
  }

  startAppointment(id: number): Observable<Appointment> {
    return this.updateAppointment(id, { status: 'in-progress' });
  }

  completeAppointment(id: number, notes?: string): Observable<Appointment> {
    const updateData: Partial<Appointment> = { 
      status: 'completed'
    };
    
    if (notes) {
      updateData.notes = notes;
    }
    
    return this.updateAppointment(id, updateData);
  }

  rescheduleAppointment(id: number, newDate: string, newTime: string): Observable<Appointment> {
    return this.updateAppointment(id, { 
      date: newDate, 
      time: newTime,
      status: 'scheduled'
    });
  }

  // **ELIMINAR CITA (solo admin)**
  deleteAppointment(id: number): Observable<any> {
    return this.apiService.deleteAppointment(id).pipe(
      tap(() => this.loadAppointments())
    );
  }

  // **ESTADÍSTICAS**
  getAppointmentStats(): Observable<any> {
    return this.appointments$.pipe(
      map(appointments => {
        const today = new Date().toISOString().split('T')[0];
        
        return {
          total: appointments.length,
          today: appointments.filter(apt => apt.date === today).length,
          pending: appointments.filter(apt => apt.status === 'scheduled').length,
          completed: appointments.filter(apt => apt.status === 'completed').length,
          cancelled: appointments.filter(apt => apt.status === 'cancelled').length
        };
      })
    );
  }

  // **UTILIDADES**
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

  getStatusColor(status: string): string {
    switch (status) {
      case 'scheduled': return '#ffa500';
      case 'confirmed': return '#28a745';
      case 'in-progress': return '#007bff';
      case 'completed': return '#6f42c1';
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