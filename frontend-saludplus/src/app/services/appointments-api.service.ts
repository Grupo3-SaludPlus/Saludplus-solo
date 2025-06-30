import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, tap } from 'rxjs';

export interface Appointment {
  id: number;
  patient: number;
  doctor: number;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'pending';
  reason: string;
  location: string;
  notes?: string;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  guestId?: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentsApiService {
  private apiUrl = 'http://localhost:8000/api/appointments/';
  private appointments$ = new BehaviorSubject<Appointment[]>([]);

  constructor(private http: HttpClient) {
    this.fetchAllAppointments();
  }

  fetchAllAppointments(): void {
    this.http.get<Appointment[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error obteniendo citas:', error);
        return [];
      })
    ).subscribe(appointments => {
      this.appointments$.next(appointments);
    });
  }

  getAllAppointments(): Observable<Appointment[]> {
    return this.appointments$.asObservable();
  }

  getAppointment(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}${id}/`);
  }

  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment).pipe(
      tap(() => this.fetchAllAppointments())
    );
  }

  updateAppointment(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}${id}/`, appointment).pipe(
      tap(() => this.fetchAllAppointments())
    );
  }

  deleteAppointment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`).pipe(
      tap(() => this.fetchAllAppointments())
    );
  }

  // Métodos específicos para operaciones comunes
  cancelAppointment(id: number, reason: string): Observable<Appointment> {
    return this.updateAppointment(id, { 
      status: 'cancelled', 
      notes: reason 
    });
  }

  confirmAppointment(id: number): Observable<Appointment> {
    return this.updateAppointment(id, { status: 'confirmed' });
  }

  completeAppointment(id: number): Observable<Appointment> {
    return this.updateAppointment(id, { status: 'completed' });
  }

  startAppointment(id: number): Observable<Appointment> {
    return this.updateAppointment(id, { status: 'in-progress' });
  }

  getAppointmentsByDoctor(doctorId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}?doctor=${doctorId}`);
  }

  getAppointmentsByPatient(patientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}?patient=${patientId}`);
  }
}