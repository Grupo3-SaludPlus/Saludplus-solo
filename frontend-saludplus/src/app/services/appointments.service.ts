import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';

export interface Appointment {
  id?: number;
  patient_id: number;       // Nuevo: id del paciente
  doctor_id: number;        // Nuevo: id del médico
  patient_name: string;     // Nuevo: nombre del paciente (en snake_case)
  doctor_name: string;      // Nuevo: nombre del médico
  doctorSpecialty: string;  // Puedes conservar camelCase si luego haces mapping
  date: string;
  time: string;
  reason: string;
  priority: string;
  status: string;
  notes?: string;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private apiUrl = 'http://localhost:8000/api/appointments'; // Actualiza según tu API
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAppointments();
  }

  // **CARGAR CITAS**
  loadAppointments(): void {
    this.getAllAppointments().subscribe({
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
    return this.http.get<Appointment[]>(this.apiUrl);
  }

  getAppointment(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/${id}`);
  }

  getPatientAppointments(patientId: number): Observable<Appointment[]> {
    return this.appointments$.pipe(
      map(appointments => appointments.filter(apt => apt.patient_id === patientId))
    );
  }

  getDoctorAppointments(doctorName: string): Observable<Appointment[]> {
    return this.appointments$.pipe(
      map(appointments => appointments.filter(apt => apt.doctor_name === doctorName))
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
  createAppointment(appointment: Appointment): Observable<Appointment> {
    const url = 'http://localhost:8000/admin/api/appointment/add/';
    return this.http.post<Appointment>(url, appointment);
  }

  // **ACTUALIZAR CITA**
  updateAppointment(id: number, appointmentData: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, appointmentData).pipe(
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
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
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