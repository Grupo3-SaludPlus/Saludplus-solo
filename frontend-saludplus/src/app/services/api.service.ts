import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  user_type: 'patient' | 'doctor' | 'admin';
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  specialty?: string;
}

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender: 'M' | 'F' | 'O';
  address?: string;
  medical_history?: string;
  allergies?: string;
  emergency_contact?: string;
  priority_level: 'low' | 'medium' | 'high' | 'urgent';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_appointments?: number;
  pending_appointments?: number;
  next_appointment_date?: string;
  age_group?: string;
}

export interface Doctor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  specialty_display?: string;
  license_number: string;
  experience_years: number;
  education?: string;
  consultation_fee: number;
  is_available: boolean;
  rating: number;
  created_at: string;
  updated_at: string;
  total_appointments?: number;
  appointments_today?: number;
  average_rating?: number;
  availability_status?: string;
}

export interface Appointment {
  id: number;
  patient: number;
  patient_name?: string;
  doctor: number;
  doctor_name?: string;
  doctor_specialty?: string;
  date: string;
  time: string;
  reason: string;
  appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'routine';
  type_display?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  status_display?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priority_display?: string;
  notes?: string;
  patient_notes?: string;
  location?: string;
  duration_minutes: number;
  duration_hours?: number;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  rating?: number;
  guestId: string;
  created_at: string;
  updated_at: string;
  is_today?: boolean;
  is_past_due?: boolean;
  time_until?: string;
  can_cancel?: boolean;
}

export interface DashboardStats {
  patients: {
    total: number;
    active: number;
    new_this_month: number;
  };
  doctors: {
    total: number;
    available: number;
    specialties: Array<{specialty: string, count: number}>;
  };
  appointments: {
    total: number;
    today: number;
    pending: number;
    completed_this_month: number;
    by_status: Array<{status: string, count: number}>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));
  private userSubject = new BehaviorSubject<any>(null);

  public token$ = this.tokenSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar usuario si hay token
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.tokenSubject.next(token);
      this.userSubject.next(JSON.parse(user));
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` })
    });
  }

  // **AUTENTICACIÓN**
  login(credentials: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login/`, credentials);
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register/`, userData);
  }

  logout(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/auth/logout/`, {}, { headers });
  }

  getProfile(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/auth/profile/`, { headers });
  }

  setAuthData(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.tokenSubject.next(token);
    this.userSubject.next(user);
  }

  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  // **PACIENTES**
  getPatients(params?: any): Observable<Patient[]> {
    const headers = this.getHeaders();
    const queryParams = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.http.get<Patient[]>(`${this.baseUrl}/patients/${queryParams}`, { headers });
  }

  getPatient(id: number): Observable<Patient> {
    const headers = this.getHeaders();
    return this.http.get<Patient>(`${this.baseUrl}/patients/${id}/`, { headers });
  }

  createPatient(patient: Partial<Patient>): Observable<Patient> {
    const headers = this.getHeaders();
    return this.http.post<Patient>(`${this.baseUrl}/patients/`, patient, { headers });
  }

  updatePatient(id: number, patient: Partial<Patient>): Observable<Patient> {
    const headers = this.getHeaders();
    return this.http.put<Patient>(`${this.baseUrl}/patients/${id}/`, patient, { headers });
  }

  deletePatient(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/patients/${id}/`, { headers });
  }

  getPatientAppointments(id: number): Observable<Appointment[]> {
    const headers = this.getHeaders();
    return this.http.get<Appointment[]>(`${this.baseUrl}/patients/${id}/appointments/`, { headers });
  }

  getPatientMedicalSummary(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/patients/${id}/medical_summary/`, { headers });
  }

  // **DOCTORES**
  getDoctors(params?: any): Observable<Doctor[]> {
    const headers = this.getHeaders();
    const queryParams = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.http.get<Doctor[]>(`${this.baseUrl}/doctors/${queryParams}`, { headers });
  }

  getDoctor(id: number): Observable<Doctor> {
    const headers = this.getHeaders();
    return this.http.get<Doctor>(`${this.baseUrl}/doctors/${id}/`, { headers });
  }

  createDoctor(doctor: Partial<Doctor>): Observable<Doctor> {
    const headers = this.getHeaders();
    return this.http.post<Doctor>(`${this.baseUrl}/doctors/`, doctor, { headers });
  }

  updateDoctor(id: number, doctor: Partial<Doctor>): Observable<Doctor> {
    const headers = this.getHeaders();
    return this.http.put<Doctor>(`${this.baseUrl}/doctors/${id}/`, doctor, { headers });
  }

  deleteDoctor(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/doctors/${id}/`, { headers });
  }

  getDoctorSchedule(id: number, date?: string): Observable<any> {
    const headers = this.getHeaders();
    const params = date ? `?date=${date}` : '';
    return this.http.get(`${this.baseUrl}/doctors/${id}/schedule/${params}`, { headers });
  }

  getDoctorStatistics(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/doctors/${id}/statistics/`, { headers });
  }

  // **CITAS**
  getAppointments(params?: any): Observable<Appointment[]> {
    const headers = this.getHeaders();
    const queryParams = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/${queryParams}`, { headers });
  }

  getAppointment(id: number): Observable<Appointment> {
    const headers = this.getHeaders();
    return this.http.get<Appointment>(`${this.baseUrl}/appointments/${id}/`, { headers });
  }

  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    const headers = this.getHeaders();
    return this.http.post<Appointment>(`${this.baseUrl}/appointments/`, appointment, { headers });
  }

  updateAppointment(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    const headers = this.getHeaders();
    return this.http.put<Appointment>(`${this.baseUrl}/appointments/${id}/`, appointment, { headers });
  }

  deleteAppointment(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/appointments/${id}/`, { headers });
  }

  confirmAppointment(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/appointments/${id}/confirm/`, {}, { headers });
  }

  cancelAppointment(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/appointments/${id}/cancel/`, {}, { headers });
  }

  completeAppointment(id: number, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/appointments/${id}/complete/`, data, { headers });
  }

  getTodayAppointments(): Observable<Appointment[]> {
    const headers = this.getHeaders();
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/today/`, { headers });
  }

  getUpcomingAppointments(): Observable<Appointment[]> {
    const headers = this.getHeaders();
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/upcoming/`, { headers });
  }

  // **DASHBOARD Y ESTADÍSTICAS**
  getDashboardStats(): Observable<DashboardStats> {
    const headers = this.getHeaders();
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats/`, { headers });
  }
}