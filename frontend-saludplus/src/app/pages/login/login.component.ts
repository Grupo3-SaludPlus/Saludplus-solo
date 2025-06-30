import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Agregar RouterModule
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Agregar RouterModule aquí
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Usar inject() en lugar del constructor
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = {
    email: '',
    password: '',
    userType: 'patient' as 'patient' | 'doctor' | 'admin'
  };

  errorMessage = '';
  isLoading = false;

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(
      this.loginForm.email, 
      this.loginForm.password, 
      this.loginForm.userType
    ).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        
        // Redirigir según el rol del usuario
        switch (response.user.role) {
          case 'admin':
            this.router.navigate(['/admin']);
            break;
          case 'doctor':
            this.router.navigate(['/doctor']);
            break;
          case 'patient':
            this.router.navigate(['/patient']);
            break;
          default:
            this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error de login:', error);
        this.errorMessage = error.error?.error || 'Credenciales inválidas';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private validateForm(): boolean {
    if (!this.loginForm.email.trim()) {
      this.errorMessage = 'El email es requerido';
      return false;
    }

    if (!this.loginForm.password.trim()) {
      this.errorMessage = 'La contraseña es requerida';
      return false;
    }

    if (!this.isValidEmail(this.loginForm.email)) {
      this.errorMessage = 'Formato de email inválido';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  selectUserType(type: 'patient' | 'doctor' | 'admin') {
    this.loginForm.userType = type;
  }
}