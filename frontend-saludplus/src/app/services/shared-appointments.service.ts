import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// Interfaz base para una cita
export interface AppointmentBase {
  id?: number;
  patientId?: number | string;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'emergency';
  reason: string;
  location?: string;
  notes?: string;
}

export interface Appointment {
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedAppointmentsService {
  private apiUrl = 'http://your-backend-api-url.com/api/appointments'; // Actualiza con tu URL
  private appointmentsSubject = new BehaviorSubject<AppointmentBase[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Obtener todas las citas
  getAllAppointments(): Observable<AppointmentBase[]> {
    return this.appointments$;
  }

  // Agregar una cita
  addAppointment(appointment: AppointmentBase): void {
    const current = this.appointmentsSubject.value;
    this.appointmentsSubject.next([...current, appointment]);
  }

  // Crear una cita
  createAppointment(appointment: AppointmentBase): AppointmentBase {
    const current = this.appointmentsSubject.value;
    const newAppointment = { ...appointment, id: Date.now() };
    this.appointmentsSubject.next([...current, newAppointment]);
    return newAppointment;
  }

  // Actualizar una cita
  updateAppointment(id: number, changes: Partial<AppointmentBase>): void {
    const updated = this.appointmentsSubject.value.map(apt =>
      apt.id === id ? { ...apt, ...changes } : apt
    );
    this.appointmentsSubject.next(updated);
  }

  // Eliminar una cita
  removeAppointment(id: number): void {
    const filtered = this.appointmentsSubject.value.filter(apt => apt.id !== id);
    this.appointmentsSubject.next(filtered);
  }
}