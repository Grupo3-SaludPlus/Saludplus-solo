import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, LoginRequest, RegisterRequest, User } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  // ✅ RE-EXPORTAR los observables DESPUÉS del constructor
  get currentUser$() {
    return this.apiService.user$;
  }

  get isAuthenticated$() {
    return this.apiService.token$.pipe(
      map(token => !!token)
    );
  }

  // **GETTERS**
  get currentUserValue(): User | null {
    return this.apiService.getCurrentUser();
  }

  get isAuthenticated(): boolean {
    return this.apiService.isAuthenticated();
  }

  // **AUTENTICACIÓN**
  login(email: string, password: string): Observable<any> {
    return this.apiService.login({
      email: email,
      password: password
    }).pipe(
      tap(response => {
        if (response.token && response.user) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          // NO usar this.currentUserSubject - está en ApiService
        }
      }),
      catchError(error => {
        // Manejar error localmente en lugar de usar this.handleError
        console.error('Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.apiService.register(userData).pipe(
      tap((response: any) => {
        // Redirigir según el rol
        this.redirectByRole(response.user.role);
      })
    );
  }

  logout(): void {
    this.apiService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Incluso si falla, redirigir al login
        this.router.navigate(['/login']);
      }
    });
  }

  // **MÉTODOS DE UTILIDAD**
  private redirectByRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'doctor':
        this.router.navigate(['/doctor/dashboard']);
        break;
      case 'patient':
        this.router.navigate(['/patient/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user ? user.role === role : false;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isDoctor(): boolean {
    return this.hasRole('doctor');
  }

  isPatient(): boolean {
    return this.hasRole('patient');
  }

  getCurrentUser(): User | null {
    return this.apiService.getCurrentUser();
  }

  updateCurrentUser(userData: Partial<User>): Observable<User> {
    return this.apiService.updateProfile(userData);
  }

  validateToken(): Observable<boolean> {
    return this.apiService.validateToken();
  }
}

