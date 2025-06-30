import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface MedicalAppointment {
  id: number;
  patientId: number;
  patientName: string;
  patientAge?: number;
  doctorId: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  endTime?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'emergency' | 'rescheduled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  room?: string;
  location?: string;
  notes?: string;
  createdAt: Date;
  previousDate?: string;
  previousTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private apiUrl = 'http://localhost:8000/api/appointments/';
  private appointmentsSubject = new BehaviorSubject<MedicalAppointment[]>([]);

  constructor(private http: HttpClient) {
    this.loadAppointments();
  }

  private loadAppointments(): void {
    this.http.get<MedicalAppointment[]>(this.apiUrl).subscribe(appointments => {
      this.appointmentsSubject.next(appointments);
    });
  }

  getAllAppointments(): Observable<MedicalAppointment[]> {
    return this.appointmentsSubject.asObservable();
  }

  createAppointment(appointmentData: Omit<MedicalAppointment, 'id' | 'createdAt'>): Observable<MedicalAppointment> {
    return this.http.post<MedicalAppointment>(this.apiUrl, appointmentData).pipe(
      tap(() => this.loadAppointments())
    );
  }

  updateAppointment(updatedData: Partial<MedicalAppointment>): Observable<MedicalAppointment> {
    return this.http.patch<MedicalAppointment>(`${this.apiUrl}${updatedData.id}/`, updatedData).pipe(
      tap(() => this.loadAppointments())
    );
  }

  updateAppointmentStatus(id: number, status: MedicalAppointment['status']): Observable<MedicalAppointment> {
    return this.updateAppointment({ id, status });
  }

  deleteAppointment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`).pipe(
      tap(() => this.loadAppointments())
    );
  }

  rescheduleAppointment(id: number, newDate: string, newTime: string): Observable<MedicalAppointment> {
    return this.http.patch<MedicalAppointment>(`${this.apiUrl}${id}/reschedule/`, {
      date: newDate,
      time: newTime
    }).pipe(
      tap(() => this.loadAppointments())
    );
  }

  getAppointmentsByDoctor(doctorId: number): Observable<MedicalAppointment[]> {
    return this.http.get<MedicalAppointment[]>(`${this.apiUrl}?doctor=${doctorId}`);
  }

  getAppointmentsByPatient(patientId: number): Observable<MedicalAppointment[]> {
    return this.http.get<MedicalAppointment[]>(`${this.apiUrl}?patient=${patientId}`);
  }
}