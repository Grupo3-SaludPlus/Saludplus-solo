// src/app/services/patients-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, tap } from 'rxjs';

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  gender: string;
  blood_type: string;
  allergies: string;
  chronic: string;
  emergency_contact: string;
  allergies_list: string[];
  chronic_list: string[];
}

@Injectable({ providedIn: 'root' })
export class PatientsApiService {
  private apiUrl = 'http://localhost:8000/api/patients/';
  private patients$ = new BehaviorSubject<Patient[]>([]);

  constructor(private http: HttpClient) {
    this.fetchAllPatients();
  }

  fetchAllPatients(): void {
    this.http.get<Patient[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error obteniendo pacientes:', error);
        return [];
      })
    ).subscribe(patients => {
      this.patients$.next(patients);
    });
  }

  getAllPatients(): Observable<Patient[]> {
    return this.patients$.asObservable();
  }

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}${id}/`);
  }

  createPatient(patient: Partial<Patient>): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient).pipe(
      tap(() => this.fetchAllPatients())
    );
  }

  updatePatient(id: number, patient: Partial<Patient>): Observable<Patient> {
    return this.http.patch<Patient>(`${this.apiUrl}${id}/`, patient).pipe(
      tap(() => this.fetchAllPatients())
    );
  }

  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`).pipe(
      tap(() => this.fetchAllPatients())
    );
  }
}