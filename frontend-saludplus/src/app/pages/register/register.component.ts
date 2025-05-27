import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  passwordsMatch = true;

  checkPasswords() {
    this.passwordsMatch = this.registrationForm.password === this.registrationForm.confirmPassword;
  }

  submitForm() {
    if (!this.passwordsMatch) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (!this.registrationForm.termsAccepted) {
      alert('Debes aceptar los términos y condiciones para continuar');
      return;
    }
    
    // En un caso real, aquí enviarías los datos al backend
    console.log('Registro enviado:', this.registrationForm);
    alert('¡Registro exitoso! Ya puedes acceder con tu cuenta.');
    
    // Limpiar formulario
    this.registrationForm = {
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
      termsAccepted: false
    };
  }
}
