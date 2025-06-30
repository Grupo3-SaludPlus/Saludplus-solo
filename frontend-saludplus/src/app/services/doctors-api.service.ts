import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, tap } from 'rxjs';

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  email: string;
  image?: string;
  rating?: number;
  education?: string;
  experience?: string;
  availability?: string;
  biography?: string;
  phoneNumber?: string;
  consultationFee?: number;
  isOnCall?: boolean;
  department?: string;
  license?: string;
}

@Injectable({ providedIn: 'root' })
export class DoctorsApiService {
  private apiUrl = 'http://localhost:8000/api/doctors/';
  private doctors$ = new BehaviorSubject<Doctor[]>([]);

  constructor(private http: HttpClient) {
    this.fetchAllDoctors();
  }

  fetchAllDoctors(): void {
    this.http.get<Doctor[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error obteniendo doctores:', error);
        return [];
      })
    ).subscribe(doctors => {
      this.doctors$.next(doctors);
    });
  }

  getAllDoctors(): Observable<Doctor[]> {
    return this.doctors$.asObservable();
  }

  getDoctor(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}${id}/`);
  }

  createDoctor(doctor: Partial<Doctor>): Observable<Doctor> {
    return this.http.post<Doctor>(this.apiUrl, doctor).pipe(
      tap(() => this.fetchAllDoctors())
    );
  }

  updateDoctor(id: number, doctor: Partial<Doctor>): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.apiUrl}${id}/`, doctor).pipe(
      tap(() => this.fetchAllDoctors())
    );
  }

  deleteDoctor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`).pipe(
      tap(() => this.fetchAllDoctors())
    );
  }
}