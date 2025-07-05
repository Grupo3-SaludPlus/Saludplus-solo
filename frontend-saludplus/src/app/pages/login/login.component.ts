import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = {
    email: '',
    password: ''
    // Eliminar userType ya que se detectará automáticamente
  };

  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // ELIMINAR el método selectUserType completamente
  // selectUserType(type: 'admin' | 'doctor' | 'patient') { ... }

  async onSubmit() {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // El backend detectará automáticamente el tipo de usuario
      const response = await this.authService.login(
        this.loginForm.email,
        this.loginForm.password
      ).toPromise();

      if (response && response.user) {
        // Redirigir basándose en el rol detectado por el backend
        this.redirectBasedOnRole(response.user.role);
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      this.errorMessage = error.error?.message || 'Credenciales incorrectas';
    } finally {
      this.isLoading = false;
    }
  }

  private redirectBasedOnRole(role: string) {
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
        break;
    }
  }
}