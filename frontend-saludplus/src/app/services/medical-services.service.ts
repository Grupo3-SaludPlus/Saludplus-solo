import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface MedicalService {
  id: number;
  name: string;
  description: string;
  category: string;
  duration?: string;
  price?: number;
  requiresAppointment: boolean;
  availableOnline: boolean;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicalServicesService {
  private apiUrl = 'http://localhost:8000/api/medical-services/';
  private servicesSubject = new BehaviorSubject<MedicalService[]>([]);

  constructor(private http: HttpClient) {
    this.loadServices();
  }

  private loadServices(): void {
    this.http.get<MedicalService[]>(this.apiUrl).subscribe(services => {
      this.servicesSubject.next(services);
    });
  }

  getServices(): Observable<MedicalService[]> {
    return this.servicesSubject.asObservable();
  }

  getAllServices(): MedicalService[] {
    return this.servicesSubject.getValue();
  }

  addService(service: MedicalService): Observable<MedicalService> {
    return this.http.post<MedicalService>(this.apiUrl, service).pipe(
      tap(() => this.loadServices())
    );
  }

  updateService(service: MedicalService): Observable<MedicalService> {
    return this.http.patch<MedicalService>(`${this.apiUrl}${service.id}/`, service).pipe(
      tap(() => this.loadServices())
    );
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`).pipe(
      tap(() => this.loadServices())
    );
  }
}