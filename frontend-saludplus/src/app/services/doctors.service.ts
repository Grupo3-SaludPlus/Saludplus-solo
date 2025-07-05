import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Doctor } from './api.service'; // Importa la interfaz Doctor correcta

@Injectable({
  providedIn: 'root'
})
export class DoctorsService {
  private doctorsSubject = new BehaviorSubject<Doctor[]>([]);
  public doctors$ = this.doctorsSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadDoctors();
  }

  // **CARGAR DOCTORES**
  loadDoctors(): void {
    this.apiService.getDoctors().subscribe({
      next: (doctors) => {
        // Asegura que todos los doctores tengan el campo phone
        this.doctorsSubject.next(
          doctors.map(d => ({
            ...d,
            phone: d.phone || '', // Elimina d.phoneNumber
          }))
        );
      },
      error: (error) => {
        console.error('Error cargando doctores:', error);
        // Usar datos por defecto si falla la API
        this.doctorsSubject.next(this.getDefaultDoctors());
      }
    });
  }

  // **OBTENER DOCTORES**
  getAllDoctors(): Observable<Doctor[]> {
    return this.doctors$;
  }

  getDoctor(id: number): Observable<Doctor> {
    return this.apiService.getDoctor(id);
  }

  getDoctorsBySpecialty(specialty: string): Observable<Doctor[]> {
    return this.doctors$.pipe(
      map(doctors => doctors.filter(doctor => doctor.specialty === specialty))
    );
  }

  getSpecialties(): Observable<string[]> {
    return this.doctors$.pipe(
      map(doctors => [...new Set(doctors.map(doctor => doctor.specialty))])
    );
  }

  searchDoctors(term: string): Observable<Doctor[]> {
    return this.doctors$.pipe(
      map(doctors => doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(term.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(term.toLowerCase())
      ))
    );
  }

  // **CREAR/ACTUALIZAR DOCTOR (solo admin)**
  createDoctor(doctorData: Partial<Doctor>): Observable<Doctor> {
    return this.apiService.createDoctor(doctorData).pipe(
      tap(() => this.loadDoctors())
    );
  }

  updateDoctor(id: number, doctorData: Partial<Doctor>): Observable<Doctor> {
    return this.apiService.updateDoctor(id, doctorData).pipe(
      tap(() => this.loadDoctors())
    );
  }

  // **DATOS POR DEFECTO**
  private getDefaultDoctors(): Doctor[] {
    return [
      {
        id: 1,
        name: 'Dra. Carla Mendoza Silva',
        specialty: 'Cardiología',
        email: 'carla.mendoza@saludplus.com',
        phone: '+56 9 1234 5678'
      },
      {
        id: 2,
        name: 'Dr. Roberto Álvarez Gómez',
        specialty: 'Pediatría',
        email: 'roberto.alvarez@saludplus.com',
        phone: '+56 9 2345 6789'
      },
      {
        id: 3,
        name: 'Dra. Valentina Torres Ruiz',
        specialty: 'Neurología',
        email: 'valentina.torres@saludplus.com',
        phone: '+56 9 3456 7890'
      },
      {
        id: 4,
        name: 'Dr. Andrés Soto Pérez',
        specialty: 'Traumatología',
        email: 'andres.soto@saludplus.com',
        phone: '+56 9 4567 8901'
      },
      {
        id: 5,
        name: 'Dra. María López Castro',
        specialty: 'Dermatología',
        email: 'maria.lopez@saludplus.com',
        phone: '+56 9 5678 9012'
      }
    ];
  }

  // **ELIMINAR DOCTOR (solo admin)**
  removeDoctor(id: number): Observable<void> {
    return this.apiService.deleteDoctor(id).pipe(
      tap(() => this.loadDoctors())
    );
  }
}