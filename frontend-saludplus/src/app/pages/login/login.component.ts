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
  };

  errorMessage: string = '';
  isLoading: boolean = false;
  // ✅ AÑADIDO: Propiedad para controlar la visibilidad de la contraseña
  showPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // ✅ AÑADIDO: Método para alternar la visibilidad de la contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await this.authService.login(
        this.loginForm.email,
        this.loginForm.password
      ).toPromise();

      if (response && response.user) {
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