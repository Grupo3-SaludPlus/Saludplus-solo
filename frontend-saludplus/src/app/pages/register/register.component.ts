import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  title = 'Registro de Usuario';
  subtitle = 'Crea tu cuenta para acceder a beneficios exclusivos';
  
  registrationForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rut: '',
    birthDate: '',
    phone: '',
    address: '',
    insurance: '',
    gender: 'other',
    bloodType: '',
    termsAccepted: false
  };

  insuranceOptions = [
    'Consalud',
    'Banmédica',
    'Colmena',
    'Cruz Blanca',
    'Fonasa',
    'Otra'
  ];

  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  passwordsMatch = true;
  formError = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  checkPasswords() {
    this.passwordsMatch = this.registrationForm.password === this.registrationForm.confirmPassword;
  }

  // Método para mapear el género del formulario al valor correcto para la API
  private mapGender(formGender: string): 'M' | 'F' | 'O' {
    switch (formGender) {
      case 'male': return 'M';
      case 'female': return 'F';
      default: return 'O';
    }
  }

  submitForm() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.formError = '';
    
    // Validaciones básicas
    if (!this.registrationForm.firstName || !this.registrationForm.lastName) {
      this.formError = 'Por favor ingrese su nombre y apellido';
      this.isSubmitting = false;
      return;
    }
    
    if (!this.registrationForm.email) {
      this.formError = 'Por favor ingrese su correo electrónico';
      this.isSubmitting = false;
      return;
    }
    
    if (!this.registrationForm.password || this.registrationForm.password.length < 6) {
      this.formError = 'La contraseña debe tener al menos 6 caracteres';
      this.isSubmitting = false;
      return;
    }
    
    if (!this.passwordsMatch) {
      this.formError = 'Las contraseñas no coinciden';
      this.isSubmitting = false;
      return;
    }
    
    if (!this.registrationForm.termsAccepted) {
      this.formError = 'Debe aceptar los términos y condiciones';
      this.isSubmitting = false;
      return;
    }
    
    // Construir el objeto de usuario
    const newUser: Partial<User> = {
      name: `${this.registrationForm.firstName} ${this.registrationForm.lastName}`,
      email: this.registrationForm.email,
      phone: this.registrationForm.phone,
      dateOfBirth: this.registrationForm.birthDate,
      gender: this.mapGender(this.registrationForm.gender),  // Usar el método para mapear el género
      bloodType: this.registrationForm.bloodType,
      insurance: this.registrationForm.insurance
    };
    
    // Registrar al usuario
    const registeredUser = this.authService.registerPatient(newUser, this.registrationForm.password);
    
    if (registeredUser) {
      // Registro exitoso, redirigir al dashboard
      this.router.navigate(['/patient/dashboard']);
    } else {
      // Error en el registro
      this.formError = 'El correo electrónico ya está registrado';
      this.isSubmitting = false;
    }
  }
}
