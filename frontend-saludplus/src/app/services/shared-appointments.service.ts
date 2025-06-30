import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { map } from 'rxjs/operators'; // Añadir esta importación
import { isPlatformBrowser } from '@angular/common';

export interface AppointmentBase {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  reason: string;
  location: string;
  notes?: string;
  createdAt: Date;
  // Añadir la propiedad priority como opcional
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  // Propiedad para identificar citas de invitados
  guestId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedAppointmentsService {
  private apiUrl = 'http://localhost:8000/api/appointments/';
  private STORAGE_KEY = 'saludplus_appointments';
  private GUEST_ID_KEY = 'saludplus_guest_id';
  private appointmentsSubject = new BehaviorSubject<AppointmentBase[]>([]);
  private appointmentsLoaded = false;
  private isBrowser: boolean;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadAppointments();
  }
  
  // Cargar citas del API
  private loadAppointments(): void {
    if (this.appointmentsLoaded) return;
    
    let appointments: AppointmentBase[] = [];
    
    // Solo intentar acceder a API si estamos en el navegador
    if (this.isBrowser) {
      const storedData = API.getItem(this.STORAGE_KEY);
      if (storedData) {
        try {
          appointments = JSON.parse(storedData);
        } catch (e) {
          console.error('Error al cargar citas:', e);
        }
      } else {
        // Datos iniciales de ejemplo
        appointments = this.getSampleAppointments();
        this.saveToStorage(appointments);
      }
    }
    
    this.appointmentsSubject.next(appointments);
    this.appointmentsLoaded = true;
  }
  
  // Guardar citas en API
  private saveToStorage(appointments: AppointmentBase[]): void {
    // Solo intentar guardar en API si estamos en el navegador
    if (this.isBrowser) {
      try {
        API.setItem(this.STORAGE_KEY, JSON.stringify(appointments));
      } catch (e) {
        console.error('Error al guardar citas:', e);
      }
    }
  }
  
  // Obtener todas las citas
  getAllAppointments(): Observable<AppointmentBase[]> {
    if (!this.appointmentsLoaded && this.isBrowser) {
      this.loadAppointments();
    }
    return this.appointmentsSubject.asObservable();
  }
  
  // Obtener citas de un paciente específico
  getPatientAppointments(patientId: number): Observable<AppointmentBase[]> {
    return this.getAllAppointments().pipe(
      map((appointments: AppointmentBase[]) => 
        appointments.filter((apt: AppointmentBase) => apt.patientId === patientId)
      )
    );
  }
  
  // Obtener citas de un médico específico
  getDoctorAppointments(doctorId: number): Observable<AppointmentBase[]> {
    const filtered = new BehaviorSubject<AppointmentBase[]>(
      this.appointmentsSubject.value.filter(a => a.doctorId === doctorId)
    );
    return filtered.asObservable();
  }
  
  // Obtener citas de invitados
  getGuestAppointments(): Observable<AppointmentBase[]> {
    const guestId = this.getGuestId();
    return of(this.appointmentsSubject.value.filter(app => 
      // Verificar que la propiedad exista antes de compararla
      app.guestId !== undefined && app.guestId === guestId
    ));
  }
  
  // Crear nueva cita
  createAppointment(appointment: Partial<AppointmentBase>): Observable<AppointmentBase> {
    return this.http.post<AppointmentBase>(this.apiUrl, appointment).pipe(
      tap(() => this.loadAppointments())
    );
  }
  
  // Actualizar una cita existente
  updateAppointment(id: number, updatedAppointment: Partial<AppointmentBase>): Observable<AppointmentBase> {
    return this.http.patch<AppointmentBase>(`${this.apiUrl}${id}/`, updatedAppointment).pipe(
      tap(() => this.loadAppointments())
    );
  }
  
  // Actualizar el estado de una cita
  updateStatus(id: number, status: AppointmentBase['status'], notes?: string): Observable<AppointmentBase> | null {
    const update: Partial<AppointmentBase> = { id, status };
    if (notes) update.notes = notes;
    return this.updateAppointment(id, update);
  }
  
  // Cancelar una cita
  cancelAppointment(id: number, reason: string): Observable<AppointmentBase> {
    return this.updateAppointment(id, {
      status: 'cancelled',
      notes: `Cita cancelada. Motivo: ${reason}`
    });
  }
  
  // Eliminar una cita (solo administradores)
  deleteAppointment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`).pipe(
      tap(() => this.loadAppointments())
    );
  }
  
  // Datos de ejemplo
  private getSampleAppointments(): AppointmentBase[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const todayStr = this.formatDateForStorage(today);
    const tomorrowStr = this.formatDateForStorage(tomorrow);
    const nextWeekStr = this.formatDateForStorage(nextWeek);
    
    return [
      {
        id: 1,
        patientId: 101,
        patientName: 'Laura González',
        doctorId: 201,
        doctorName: 'Dr. Carlos Méndez',
        specialty: 'Cardiología',
        date: todayStr,
        time: '10:00',
        status: 'scheduled',
        reason: 'Control rutinario',
        location: 'Consultorio 305',
        notes: '',
        createdAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) // una semana antes
      },
      {
        id: 2,
        patientId: 102,
        patientName: 'Martín Rodríguez',
        doctorId: 202,
        doctorName: 'Dra. Ana Silva',
        specialty: 'Dermatología',
        date: tomorrowStr,
        time: '15:30',
        status: 'confirmed',
        reason: 'Revisión de lesión cutánea',
        location: 'Consultorio 210',
        notes: '',
        createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        patientId: 101,
        patientName: 'Laura González',
        doctorId: 203,
        doctorName: 'Dr. Roberto Paredes',
        specialty: 'Traumatología',
        date: todayStr,
        time: '16:00',
        status: 'in-progress',
        reason: 'Dolor en rodilla izquierda',
        location: 'Consultorio 105',
        notes: '',
        createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 4,
        patientId: 103,
        patientName: 'Carmen Estévez',
        doctorId: 201,
        doctorName: 'Dr. Carlos Méndez',
        specialty: 'Cardiología',
        date: nextWeekStr,
        time: '11:30',
        status: 'scheduled',
        reason: 'Seguimiento post operatorio',
        location: 'Consultorio 305',
        notes: '',
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
      }
    ];
  }
  
  private formatDateForStorage(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Añadir este método para depuración
  debugAppointments(): void {
    const appointments = this.appointmentsSubject.value;
    console.log('Total de citas guardadas:', appointments.length);
    console.log('Citas:', appointments);
    
    // Verificar API solo si estamos en el navegador
    if (this.isBrowser) {
      const storedData = API.getItem(this.STORAGE_KEY);
      console.log('Datos en API:', storedData ? JSON.parse(storedData) : 'No hay datos');
    } else {
      console.log('Ejecutando en servidor - API no disponible');
    }
  }

  // Agregar este método para obtener o crear un ID de invitado
  private getGuestId(): string {
    if (this.isBrowser) {
      let guestId = API.getItem(this.GUEST_ID_KEY);
      if (!guestId) {
        guestId = 'guest-' + new Date().getTime() + '-' + Math.random().toString(36).substring(2, 9);
        API.setItem(this.GUEST_ID_KEY, guestId);
      }
      return guestId;
    }
    return 'guest-unknown';
  }

  // Método para obtener el siguiente ID disponible (máximo + 1)
  private getNextId(): number {
    const appointments = this.appointmentsSubject.value;
    return appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
  }
}