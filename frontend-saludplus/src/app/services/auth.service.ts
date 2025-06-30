import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { DoctorsService, Doctor } from './doctors.service';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';
import { ApiService, LoginRequest, RegisterRequest } from './api.service';

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  profile?: any;
  // Campos adicionales para compatibilidad
  phone?: string;
  birthdate?: string;
  gender?: 'M' | 'F' | 'O';
  bloodType?: string;
  allergies?: string[];
  chronic?: string[];
  emergencyContact?: string;
  createdAt?: string;
  specialty?: string; // Para doctores
}

@Injectable({
  providedIn: 'root'  // Esto es importante
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public currentUser = this.currentUser$; // Para compatibilidad
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
    private doctorsService: DoctorsService,
    private http: HttpClient,
    private apiService: ApiService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Cargar usuario desde token si existe
    this.loadUserFromStorage(); // Cambiar esta línea
  }

  // Cargar usuario desde localStorage al iniciar
  private loadUserFromStorage(): void {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
      try {
        const userData = JSON.parse(user);
        this.currentUserSubject.next(userData);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string, userType: 'patient' | 'doctor' | 'admin' = 'patient'): Observable<any> {
    const loginData: LoginRequest = {
      email,
      password,
      user_type: userType
    };

    return this.apiService.login(loginData).pipe(
      map(response => {
        if (response.token && response.user) {
          // Mapear datos del backend al formato esperado
          const userData: User = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            role: response.user.role,
            profile: response.user.profile,
            // Mapear campos del perfil si existen
            phone: response.user.profile?.phone || '',
            gender: response.user.profile?.gender || 'O',
            birthdate: response.user.profile?.birthdate || '',
            bloodType: response.user.profile?.bloodType || '',
            allergies: response.user.profile?.allergies ? 
              response.user.profile.allergies.split(',').map((a: string) => a.trim()) : [],
            chronic: response.user.profile?.chronic ? 
              response.user.profile.chronic.split(',').map((c: string) => c.trim()) : [],
            emergencyContact: response.user.profile?.emergency_contact || '',
            createdAt: response.user.profile?.created_at || new Date().toISOString(),
            specialty: response.user.profile?.specialty || ''
          };

          this.apiService.setAuthData(response.token, userData);
          this.currentUserSubject.next(userData);
          this.isAuthenticatedSubject.next(true);
          
          return response;
        } else {
          throw new Error('Invalid response format');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.apiService.register(userData).pipe(
      map(response => {
        if (response.token && response.user) {
          const userMapped: User = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            role: response.user.role,
            profile: response.user.profile,
            phone: response.user.profile?.phone || '',
            gender: response.user.profile?.gender || 'O',
            birthdate: response.user.profile?.birthdate || '',
            bloodType: '',
            allergies: [],
            chronic: [],
            emergencyContact: '',
            createdAt: new Date().toISOString(),
            specialty: response.user.profile?.specialty || ''
          };

          this.apiService.setAuthData(response.token, userMapped);
          this.currentUserSubject.next(userMapped);
          this.isAuthenticatedSubject.next(true);
          
          return response;
        } else {
          throw new Error('Invalid response format');
        }
      }),
      catchError(error => {
        console.error('Register error:', error);
        throw error;
      })
    );
  }

  logout(): void {
    // Llamar al endpoint de logout del backend
    if (this.isAuthenticatedSubject.value) {
      this.apiService.logout().subscribe({
        complete: () => {
          this.performLogout();
        },
        error: () => {
          // Incluso si falla el logout del backend, limpiar localmente
          this.performLogout();
        }
      });
    } else {
      this.performLogout();
    }
  }

  private performLogout(): void {
    // Limpiar datos locales
    this.apiService.clearAuthData();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  // Métodos adicionales para compatibilidad
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isDoctor(): boolean {
    return this.hasRole('doctor');
  }

  isPatient(): boolean {
    return this.hasRole('patient');
  }

  updateCurrentUser(updatedUser: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      this.currentUserSubject.next(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  }

  // Métodos de compatibilidad
  getUsers(): User[] {
    console.warn('getUsers() is deprecated. Use ApiService methods instead');
    return [];
  }

  getAllUsersForAdmin(): User[] {
    console.warn('getAllUsersForAdmin() is deprecated. Use ApiService methods instead');
    return [];
  }

  getUserById(id: number | string): User | undefined {
    console.warn('getUserById() is deprecated. Use ApiService methods instead');
    return undefined;
  }

  updateUser(user: User): boolean {
    console.warn('updateUser() is deprecated. Use ApiService methods instead');
    return false;
  }

  deleteUser(id: number | string): boolean {
    console.warn('deleteUser() is deprecated. Use ApiService methods instead');
    return false;
  }

  registerPatient(userData: any, password: string): User | null {
    console.warn('registerPatient() is deprecated. Use register() method instead');
    return null;
  }

  // Verificar token con el backend
  validateToken(): Observable<boolean> {
    if (!this.apiService.isAuthenticated()) {
      return of(false);
    }

    return this.apiService.getProfile().pipe(
      map(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
          return true;
        }
        return false;
      }),
      catchError(() => {
        this.performLogout();
        return of(false);
      })
    );
  }
}
