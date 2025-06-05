import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  // Propiedades de paciente
  phone?: string;
  // Propiedades de médico
  specialty?: string;
  license?: string;
  // Propiedades de admin - AGREGAR
  department?: string;
  permissions?: string[];
  // Estado
  loggedIn: boolean;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getUserFromLocalStorage(): User | null {
    if (this.isBrowser) {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        return JSON.parse(userJson);
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.role === role;
  }

  // NUEVO: Método específico para médicos
  isDoctor(): boolean {
    return this.hasRole('doctor');
  }

  // NUEVO: Método para obtener la especialidad del médico
  getDoctorSpecialty(): string | undefined {
    return this.currentUserValue?.specialty;
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  saveUserToLocalStorage(user: User) {
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  // ACTUALIZAR: Método para login de médico con datos reales
  loginDoctor(email: string, password: string): boolean {
    // Lista de médicos basada en tu doctors.component.ts
    const doctors = [
      {
        id: 'doc-001',
        name: 'Dra. Carla Mendoza',
        email: 'carla.mendoza@saludplus.com',
        specialty: 'Cardiología',
        license: 'MP-12345',
        phone: '+56 9 1234 5678'
      },
      {
        id: 'doc-002',
        name: 'Dr. Roberto Fuentes',
        email: 'roberto.fuentes@saludplus.com',
        specialty: 'Neurología',
        license: 'MP-23456',
        phone: '+56 9 2345 6789'
      },
      {
        id: 'doc-003',
        name: 'Dra. Valentina Torres',
        email: 'valentina.torres@saludplus.com',
        specialty: 'Pediatría',
        license: 'MP-34567',
        phone: '+56 9 3456 7890'
      },
      {
        id: 'doc-004',
        name: 'Dr. Andrés Soto',
        email: 'andres.soto@saludplus.com',
        specialty: 'Traumatología',
        license: 'MP-45678',
        phone: '+56 9 4567 8901'
      },
      {
        id: 'doc-005',
        name: 'Dra. María López',
        email: 'maria.lopez@saludplus.com',
        specialty: 'Dermatología',
        license: 'MP-56789',
        phone: '+56 9 5678 9012'
      },
      {
        id: 'doc-006',
        name: 'Dr. Juan Pérez',
        email: 'juan.perez@saludplus.com',
        specialty: 'Medicina General',
        license: 'MP-67890',
        phone: '+56 9 6789 0123'
      }
    ];

    // Buscar el médico por email
    const doctor = doctors.find(doc => doc.email === email);
    
    if (doctor) {
      const mockDoctor: User = {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        role: 'doctor',
        specialty: doctor.specialty,
        license: doctor.license,
        phone: doctor.phone,
        loggedIn: true,
        token: 'doctor-token-' + doctor.id
      };

      this.saveUserToLocalStorage(mockDoctor);
      return true;
    }

    return false;
  } // CERRAR EL MÉTODO AQUÍ

  // AGREGAR este método al final de la clase
  loginAdmin(email: string, password: string): boolean {
    const admins = [
      {
        id: 'admin-001',
        name: 'Administrador Principal',
        email: 'admin@saludplus.com',
        role: 'admin' as const,
        department: 'Administración'
      },
      {
        id: 'admin-002',
        name: 'Super Admin',
        email: 'superadmin@saludplus.com',
        role: 'admin' as const,
        department: 'Sistemas'
      }
    ];

    const admin = admins.find(adm => adm.email === email);
    
    if (admin) {
      const mockAdmin: User = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        department: admin.department,
        loggedIn: true,
        token: 'admin-token-' + admin.id
      };

      this.saveUserToLocalStorage(mockAdmin);
      return true;
    }

    return false;
  }
}
