import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { DoctorsService, Doctor } from './doctors.service';

// Reemplazar completamente la interfaz User existente con esta versión completa:
export interface User {
  id: string | number;
  name: string;
  email: string;
  password?: string;
  role: 'patient' | 'doctor' | 'admin' | string;
  phone?: string;
  
  // Campos médicos adicionales
  age?: number;
  birthdate?: string;
  gender?: 'M' | 'F' | 'O';
  bloodType?: string;
  allergies?: string[];
  chronic?: string[];
  emergencyContact?: string;
  medicalNotes?: string;
  lastCheckup?: string;
  
  // Campos para doctores
  specialty?: string;
  department?: string;
  license?: string;
  profileImage?: string;
  
  // Campos para sistema
  createdAt?: Date | string;
  loggedIn?: boolean;
  token?: string;
  permissions?: string[];
  
  // Campos para paciente
  dateOfBirth?: string;
  insurance?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isBrowser: boolean;
  private usersKey = 'saludplus_users';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
    private doctorsService: DoctorsService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromLocalStorage());
    this.currentUser = this.currentUserSubject.asObservable();
    
    // Inicializar la lista de usuarios si no existe
    if (this.isBrowser && !localStorage.getItem(this.usersKey)) {
      this.initializeUsers();
    }
  }

  // Obtener todos los usuarios
  private getAllUsers(): User[] {
    if (!this.isBrowser) return [];
    const usersJson = localStorage.getItem(this.usersKey);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  // Guardar todos los usuarios
  private saveUsers(users: User[]): void {
    if (this.isBrowser) {
      localStorage.setItem(this.usersKey, JSON.stringify(users));
    }
  }

  // Inicializar usuarios demo si no existen
  private initializeUsers(): void {
    const demoUsers: User[] = [
      {
        id: 'patient-001',
        name: 'Juan Pérez',
        email: 'juan@ejemplo.com',
        role: 'patient',
        phone: '+56912345678',
        birthdate: '1990-05-15',
        gender: 'M',
        insurance: 'Fonasa',
        loggedIn: false,
        token: '',
        createdAt: new Date(),
        allergies: [],
        chronic: []
      },
      {
        id: 'patient-002',
        name: 'María González',
        email: 'maria@ejemplo.com',
        role: 'patient',
        phone: '+56987654321',
        birthdate: '1985-10-20',
        gender: 'F',
        insurance: 'Isapre',
        loggedIn: false,
        token: '',
        createdAt: new Date(),
        allergies: [],
        chronic: []
      },
      {
        id: 'admin-001',
        name: 'Administrador Principal',
        email: 'admin@saludplus.com',
        role: 'admin',
        department: 'Administración',
        permissions: ['all'],
        loggedIn: false,
        token: '',
        createdAt: new Date()
      }
    ];
    
    this.saveUsers(demoUsers);
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

  isDoctor(): boolean {
    return this.hasRole('doctor');
  }

  isPatient(): boolean {
    return this.hasRole('patient');
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

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

  // Método unificado de inicio de sesión
  login(email: string, password: string, userType: 'patient' | 'doctor' | 'admin'): boolean {
    if (userType === 'doctor') {
      return this.loginDoctor(email, password);
    } else if (userType === 'admin') {
      return this.loginAdmin(email, password);
    } else {
      return this.loginPatient(email, password);
    }
  }

  // Login para pacientes
  loginPatient(email: string, password: string): boolean {
    const users = this.getAllUsers();
    const patient = users.find(user => 
      user.role === 'patient' && user.email === email
    );
    
    if (patient) {
      const loggedInUser: User = {
        ...patient,
        loggedIn: true,
        token: 'patient-token-' + Date.now()
      };
      
      this.currentUserSubject.next(loggedInUser);
      
      const updatedUsers = users.map(u => 
        u.id === patient.id ? { ...u, loggedIn: true } : u
      );
      this.saveUsers(updatedUsers);
      
      return true;
    }
    return false;
  }

  // Login para doctores integrado con DoctorsService
  loginDoctor(email: string, password: string): boolean {
    // Obtener doctores del servicio de doctores
    const doctors = this.doctorsService.getAllDoctors();
    const doctor = doctors.find(doc => doc.email === email);
    
    if (doctor) {
      // En producción, validaríamos la contraseña
      // Convertir el Doctor a un User
      const loggedInUser: User = {
        id: 'doc-' + doctor.id,
        name: doctor.name,
        email: doctor.email,
        role: 'doctor',
        specialty: doctor.specialty,
        license: doctor.license,
        department: doctor.department,
        phone: doctor.phoneNumber,
        profileImage: doctor.image,
        loggedIn: true,
        token: 'doctor-token-' + Date.now()
      };
      
      // Guardar en localStorage y actualizar el subject
      this.saveUserToLocalStorage(loggedInUser);
      return true;
    }
    
    return false;
  }

  // Login para admin
  loginAdmin(email: string, password: string): boolean {
    const users = this.getAllUsers();
    const admin = users.find(user => 
      user.role === 'admin' && user.email === email
    );
    
    if (admin) {
      const loggedInUser: User = {
        ...admin,
        loggedIn: true,
        token: 'admin-token-' + Date.now()
      };
      
      this.currentUserSubject.next(loggedInUser);
      
      const updatedUsers = users.map(u => 
        u.id === admin.id ? { ...u, loggedIn: true } : u
      );
      this.saveUsers(updatedUsers);
      
      return true;
    }
    return false;
  }

  // Registro de nuevos pacientes
  registerPatient(newUser: Partial<User>, password: string): User | null {
    const users = this.getAllUsers();
    
    // Verificar si el email ya existe
    if (users.some(u => u.email === newUser.email)) {
      return null;
    }
    
    // Generar ID único
    const newId = 'patient-' + (users.length + 1);
    
    // Mapear el género correctamente - CORREGIDO
    let genderValue: 'M' | 'F' | 'O' = 'O';
    
    // Verificar si gender es string y convertir apropiadamente
    if (typeof newUser.gender === 'string') {
      const genderStr = newUser.gender.toLowerCase();
      if (genderStr === 'male' || genderStr === 'm') {
        genderValue = 'M';
      } else if (genderStr === 'female' || genderStr === 'f') {
        genderValue = 'F';
      } else if (genderStr === 'other' || genderStr === 'o') {
        genderValue = 'O';
      }
    } else if (newUser.gender === 'M' || newUser.gender === 'F' || newUser.gender === 'O') {
      // Si ya viene en el formato correcto
      genderValue = newUser.gender;
    }
    
    const user: User = {
      id: newId,
      name: newUser.name || '',
      email: newUser.email || '',
      password: password,
      role: 'patient',
      phone: newUser.phone,
      birthdate: newUser.dateOfBirth || newUser.birthdate,
      gender: genderValue,
      bloodType: newUser.bloodType,
      insurance: newUser.insurance,
      allergies: newUser.allergies || [],
      chronic: newUser.chronic || [],
      emergencyContact: newUser.emergencyContact,
      loggedIn: true,
      token: 'patient-token-' + Date.now(),
      createdAt: new Date()
    };
    
    users.push(user);
    this.saveUsers(users);
    this.currentUserSubject.next(user);
    
    return user;
  }

  // Actualizar perfil de usuario
  updateUserProfile(updates: Partial<User>): User | null {
    if (!this.currentUserValue || !this.isBrowser) return null;
    
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === this.currentUserValue!.id);
    
    if (userIndex === -1) {
      return null;
    }

    // Update the user with the provided updates
    const updatedUser: User = {
      ...users[userIndex],
      ...updates
    };

    users[userIndex] = updatedUser;
    this.saveUsers(users);
    this.saveUserToLocalStorage(updatedUser);
    return updatedUser;
  }

  // Solo para administradores - obtener todos los usuarios
  getAllUsersForAdmin(): User[] {
    // Verificar que el usuario actual es admin
    if (!this.isAdmin()) {
      console.warn('Acceso denegado: Se requiere rol de administrador');
      return [];
    }
    
    return this.getAllUsers();
  }

  // Eliminar usuario (solo admin)
  deleteUser(userId: string): boolean {
    if (!this.isAdmin()) {
      console.warn('Acceso denegado: Se requiere rol de administrador');
      return false;
    }
    
    const users = this.getAllUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    
    if (updatedUsers.length === users.length) {
      return false; // No se encontró el usuario
    }
    
    this.saveUsers(updatedUsers);
    return true;
  }

  // Método de depuración - solo en desarrollo
  logAllUsers(): void {
    console.log('Todos los usuarios:', this.getAllUsers());
  }

  /**
   * Obtiene el ID del usuario autenticado actualmente
   * @returns El ID del usuario o null si no hay usuario autenticado
   */
  getUserId(): string | null {
    const id = this.currentUserValue?.id;
    if (id === undefined || id === null) {
      return null;
    }
    return typeof id === 'string' ? id : id.toString();
  }

  // Añadir este método público que internamente llama al privado
  public getRegisteredUsers(): User[] {
    return this.getAllUsers();
  }

  // Añadir este método a la clase AuthService
  updateCurrentUser(updatedUser: User): void {
    // Actualizar el usuario en el BehaviorSubject
    this.currentUserSubject.next(updatedUser);
    
    // Actualizar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    // También actualizar en la lista de usuarios almacenados
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index !== -1) {
      users[index] = updatedUser;
      if (typeof window !== 'undefined') {
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
    
    console.log('Usuario actualizado:', updatedUser);
  }
}