import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Usar inject() en lugar del constructor
  private authService = inject(AuthService);
  private router = inject(Router);

  title = 'Registro de Usuario';
  subtitle = 'Crea tu cuenta para acceder a beneficios exclusivos';
  
  registrationForm = {
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: '',
    gender: 'O' as 'M' | 'F' | 'O',
    role: 'patient' as 'patient' | 'doctor',
    specialty: '', // Para doctores
    rut: '',
    address: '',
    insurance: '',
    acceptTerms: false,
    termsAccepted: false
  };

  insuranceOptions = [
    'Fonasa',
    'Isapre Banmédica',
    'Isapre Colmena',
    'Isapre Cruz Blanca',
    'Isapre Consalud',
    'Isapre Vida Tres',
    'Sin seguro'
  ];

  errorMessage = '';
  isLoading = false;
  passwordsMatch = true;

  submitForm() {
    this.onSubmit();
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Combinar firstName y lastName en name
    this.registrationForm.name = `${this.registrationForm.firstName} ${this.registrationForm.lastName}`.trim();

    const registerData = {
      name: this.registrationForm.name,
      email: this.registrationForm.email,
      password: this.registrationForm.password,
      role: this.registrationForm.role,
      ...(this.registrationForm.role === 'doctor' && { 
        specialty: this.registrationForm.specialty 
      })
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        
        // Redirigir según el rol
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
        console.error('Error de registro:', error);
        this.errorMessage = error.error?.error || 'Error al registrar usuario';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  checkPasswords() {
    this.passwordsMatch = this.registrationForm.password === this.registrationForm.confirmPassword;
  }

  private validateForm(): boolean {
    if (!this.registrationForm.firstName.trim()) {
      this.errorMessage = 'El nombre es requerido';
      return false;
    }

    if (!this.registrationForm.lastName.trim()) {
      this.errorMessage = 'El apellido es requerido';
      return false;
    }

    if (!this.registrationForm.email.trim()) {
      this.errorMessage = 'El email es requerido';
      return false;
    }

    if (!this.isValidEmail(this.registrationForm.email)) {
      this.errorMessage = 'Formato de email inválido';
      return false;
    }

    if (this.registrationForm.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }

    if (!this.passwordsMatch) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return false;
    }

    if (this.registrationForm.role === 'doctor' && !this.registrationForm.specialty.trim()) {
      this.errorMessage = 'La especialidad es requerida para doctores';
      return false;
    }

    if (!this.registrationForm.acceptTerms && !this.registrationForm.termsAccepted) {
      this.errorMessage = 'Debes aceptar los términos y condiciones';
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  selectRole(role: 'patient' | 'doctor') {
    this.registrationForm.role = role;
  }
}
