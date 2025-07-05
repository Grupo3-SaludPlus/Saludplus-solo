import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
// Interfaces base
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  birthdate?: string;
  gender?: 'M' | 'F' | 'O';
  bloodType?: string;
  allergies?: string[];
  chronic?: string[];
  emergencyContact?: string;
  createdAt?: string;
  specialty?: string;
  profile?: any;
  experience_years?: number;
  education?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  user_type?: 'patient' | 'doctor' | 'admin';
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin';
  gender?: 'M' | 'F' | 'O';
  birthdate?: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  patient_name: string;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  reason: string;
  location: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  license_number?: string;
  experience_years?: number;
  rating?: number;
  profile_image?: string;
  bio?: string;
  availability?: string;
  consultation_fee?: number;
  department?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';
  
  // Estado de autenticación
  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  private userSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  
  public token$ = this.tokenSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  // **UTILIDADES PRIVADAS**
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  private getHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Token ${token}`);
    }
    
    return headers;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    let errorMessage = 'Ha ocurrido un error';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      if (error.status === 401) {
        this.logout();
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para realizar esta acción.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado.';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // **AUTENTICACIÓN**
  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login/`, credentials).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.setAuthData(response.token, response.user);
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/register/`, userData).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.setAuthData(response.token, response.user);
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  logout(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/auth/logout/`, {}, { headers }).pipe(
      tap(() => this.clearAuthData()),
      catchError(() => {
        // Incluso si falla el logout del servidor, limpiar datos locales
        this.clearAuthData();
        return throwError(() => new Error('Error al cerrar sesión'));
      })
    );
  }

  setAuthData(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    
    this.tokenSubject.next(token);
    this.userSubject.next(user);
  }

  clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
    
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  getCurrentToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  // **CITAS MÉDICAS**
  getAppointments(params?: any): Observable<Appointment[]> {
    const headers = this.getHeaders();
    let url = `${this.baseUrl}/appointments/`;
    
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      url += `?${queryParams}`;
    }
    
    return this.http.get<Appointment[]>(url, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getAppointment(id: number): Observable<Appointment> {
    const headers = this.getHeaders();
    return this.http.get<Appointment>(`${this.baseUrl}/appointments/${id}/`, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    const headers = this.getHeaders();
    return this.http.post<Appointment>(`${this.baseUrl}/appointments/`, appointment, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateAppointment(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    const headers = this.getHeaders();
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/`, appointment, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteAppointment(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/appointments/${id}/`, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // **DOCTORES**
  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/doctors/`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getDoctor(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.baseUrl}/doctors/${id}/`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  createDoctor(doctor: Partial<Doctor>): Observable<Doctor> {
    const headers = this.getHeaders();
    return this.http.post<Doctor>(`${this.baseUrl}/doctors/`, doctor, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateDoctor(id: number, doctor: Partial<Doctor>): Observable<Doctor> {
    const headers = this.getHeaders();
    return this.http.patch<Doctor>(`${this.baseUrl}/doctors/${id}/`, doctor, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteDoctor(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.baseUrl}/doctors/${id}/`, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // **PERFIL DE USUARIO**
  getProfile(): Observable<User> {
    const headers = this.getHeaders();
    return this.http.get<User>(`${this.baseUrl}/auth/profile/`, { headers }).pipe(
      tap(user => this.userSubject.next(user)),
      catchError(this.handleError.bind(this))
    );
  }

  updateProfile(profile: Partial<User>): Observable<User> {
    const headers = this.getHeaders();
    return this.http.patch<User>(`${this.baseUrl}/auth/profile/`, profile, { headers }).pipe(
      tap(user => this.userSubject.next(user)),
      catchError(this.handleError.bind(this))
    );
  }

  // **ESTADÍSTICAS Y DASHBOARD**
  getDashboardStats(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.baseUrl}/dashboard/stats/`, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // **VALIDAR TOKEN**
  validateToken(): Observable<boolean> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('No hay token'));
    }
    
    return this.getProfile().pipe(
      map(() => true), // ✅ CORREGIR: retornar boolean
      catchError(() => {
        this.clearAuthData();
        return throwError(() => new Error('Token inválido'));
      })
    );
  }
}