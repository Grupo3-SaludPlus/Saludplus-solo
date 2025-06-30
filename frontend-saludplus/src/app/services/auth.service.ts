import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { DoctorsService, Doctor } from './doctors.service';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';

// Actualizar la interfaz User para incluir todas las propiedades utilizadas
export interface User {
  id: string | number;
  name: string;
  email: string;
  password?: string;
  role: 'patient' | 'doctor' | 'admin';
  loggedIn?: boolean;
  
  // Campos del sistema
  createdAt?: Date | string;
  token?: string;
  permissions?: string[];
  
  // Campos para paciente
  dateOfBirth?: string;
  birthdate?: string; // Alias para dateOfBirth
  insurance?: string;
  phone?: string;
  gender?: 'M' | 'F' | 'O' | string;
  bloodType?: string;
  allergies?: string[];
  chronic?: string[];
  emergencyContact?: string;
  status?: string;
  
  // Campos para doctor
  specialty?: string;
  license?: string;
  profileImage?: string;
  
  // Campos para admin
  department?: string;
  
  // Campos adicionales
  age?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;
  private usersKey = 'saludplus_users';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
    private doctorsService: DoctorsService,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Cargar usuario desde token si existe
    this.loadCurrentUser();
    
    // Inicializar la lista de usuarios si no existe
    if (this.isBrowser (this.usersKey)) {
      this.initializeUsers();
    }
  }

  // Obtener todos los usuarios
  private getUsers(): User[] {
    if (!this.isBrowser) return [];
    const usersJson = .getItem(this.usersKey);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  // Guardar todos los usuarios
  private saveUsers(users: User[]): void {
    if (this.isBrowser) {
      .setItem(this.usersKey, JSON.stringify(users));
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getUserFromAPI(): User | null {
    if (this.isBrowser) {
      const userJson = .getItem('currentUser');
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
      .removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  saveUserToAPI(user: User) {
    if (this.isBrowser) {
      .setItem('currentUser', JSON.stringify(user));
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
    const users = this.getUsers(); // Actualizado
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
      
      return true;
    }
    
    return false;
  }

  // Login para admin
  loginAdmin(email: string, password: string): boolean {
    const users = this.getUsers();
    const admin = users.find((user: User) => 
      user.role === 'admin' && user.email === email
    );
    
    if (admin) {
      const loggedInUser: User = {
        ...admin,
        loggedIn: true,
        token: 'admin-token-' + Date.now()
      };
      
      this.currentUserSubject.next(loggedInUser);
      
      const updatedUsers = users.map((u: User) => 
        u.id === admin.id ? { ...u, loggedIn: true } : u
      );
      this.saveUsers(updatedUsers);
      
      return true;
    }
    return false;
  }

  // Registro de nuevos pacientes
  registerPatient(newUser: Partial<User>, password: string): User | null {
    const users = this.getUsers();
    
    // Verificar si el email ya existe
    if (users.some((u: User) => u.email === newUser.email)) {
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
    
    const users = this.getUsers();
    const userIndex = users.findIndex((u: User) => u.id === this.currentUserValue!.id);
    
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
    return updatedUser;
  }

  // Solo para administradores - obtener todos los usuarios
  getAllUsersForAdmin(): User[] {
    // Verificar que el usuario actual es admin
    if (!this.isAdmin()) {
      console.warn('Acceso denegado: Se requiere rol de administrador');
      return [];
    }
    
    return this.getUsers(); // Actualizado
  }

  // Eliminar usuario (solo admin)
  deleteUser(userId: string): boolean {
    if (!this.isAdmin()) {
      console.warn('Acceso denegado: Se requiere rol de administrador');
      return false;
    }
    
    const users = this.getUsers();
    const updatedUsers = users.filter((u: User) => u.id !== userId);
    
    if (updatedUsers.length === users.length) {
      return false; // No se encontró el usuario
    }
    
    this.saveUsers(updatedUsers);
    return true;
  }

  // Método de depuración - solo en desarrollo
  logAllUsers(): void {
    this.getAllUsers().subscribe((users: User[]) => {
      console.log('Todos los usuarios:', users);
      
    });
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
    return this.getUsers(); // Actualizado
  }


  updateCurrentUser(updatedUser: User): void {
    
    this.currentUserSubject.next(updatedUser);
    

    if (this.isBrowser) {
      .setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    // También actualizar en la lista de usuarios almacenados
    const users = this.getUsers();
    const index = users.findIndex((u: User) => u.id === updatedUser.id);
    
    if (index !== -1) {
      users[index] = updatedUser;
      if (this.isBrowser) {
        .setItem(this.usersKey, JSON.stringify(users));
      }
    }
    
    console.log('Usuario actualizado:', updatedUser);
  }

  // Agregar este método a la clase AuthService

  /**
   * Obtiene todos los usuarios registrados en el sistema
   * (solo disponible para administradores)
   */
  getAllUsers(): Observable<User[]> {
    // Verificar si el usuario actual es admin
    const currentUser = this.currentUserValue;
    if (!currentUser || currentUser.role !== 'admin') {
      console.warn('Acceso no autorizado a lista de usuarios');
      return of([]);
    }
    
    // Si está en el navegador, obtener usuarios del localStorage
    if (this.isBrowser) {
      const users = this.getUsers(); // Usar el método privado actualizado
      return of(users);
    }
    
    return of([]);
  }

  getAllRegisteredUsers(): User[] {
    const users = .getItem('saludplus_users');
    return users ? JSON.parse(users) : [];
  }

  getPatients(): User[] {
    return this.getRegisteredUsers().filter((u: User) => u.role === 'patient');
  }

  savePatient() {
    // Si estás actualizando un paciente existente
    if (this.currentUserValue && this.currentUserValue.role === 'patient') {
      // Actualiza el perfil del usuario actual
      this.updateUserProfile(this.currentUserValue);
    } else {
      // Registra un nuevo paciente con una contraseña predeterminada 
      // (debería cambiarse después del primer inicio de sesión)
      const password = '123456'; // Considera generar una contraseña aleatoria en producción
      this.registerPatient({
        email: this.currentUserValue?.email || '',
        name: this.currentUserValue?.name || '',
        role: 'patient',
        // Añade otras propiedades necesarias
      }, password);
    }
    
    // Puedes emitir un evento o usar otro método para notificar que se guardó
    console.log('Paciente guardado correctamente');
    
    // Usar el router para navegar después de guardar si es necesario
    // this.router.navigate(['/patients']);
  }
}
