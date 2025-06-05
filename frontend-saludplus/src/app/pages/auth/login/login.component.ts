import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    if (this.authService.currentUserValue) {
      const user = this.authService.currentUserValue;
      if (user.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (user.role === 'doctor') {
        this.router.navigate(['/doctor-dashboard']);
      } else if (user.role === 'patient') {
        this.router.navigate(['/profile']);
      }
    }
  }

  ngOnInit() {}

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    this.error = '';

    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    if (email && password) {
      // Verificar si es un administrador
      if (email.includes('admin')) {
        const mockAdmin = {
          email: email,
          role: 'admin' as 'patient' | 'doctor' | 'admin',
          name: 'Administrador',
          id: 'admin-1',
          loggedIn: true,
          token: 'admin-token-123'
        };

        this.authService.saveUserToLocalStorage(mockAdmin);
        this.loading = false;
        this.router.navigate(['/admin/dashboard']);
        return;
      }

      // Verificar si es un médico
      if (email.includes('doctor') || 
          email.includes('dr') || 
          email.includes('medico') ||
          email.includes('@saludplus.com')) {
        
        const loginSuccess = this.authService.loginDoctor(email, password);
        if (loginSuccess) {
          this.loading = false;
          this.router.navigate(['/doctor-dashboard']);
          return;
        } else {
          this.error = 'Credenciales de médico incorrectas';
          this.loading = false;
          return;
        }
      }

      // Login de paciente normal
      const mockUser = {
        email: email,
        role: 'patient' as 'patient' | 'doctor' | 'admin',
        name: email.split('@')[0],
        id: '123',
        phone: '+56 9 1122 3344',
        loggedIn: true,
        token: 'token123'
      };

      this.authService.saveUserToLocalStorage(mockUser);
      this.loading = false;
      this.router.navigate(['/profile']);
      
    } else {
      this.error = 'Por favor complete todos los campos';
      this.loading = false;
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName === 'email' ? 'Email' : 'Contraseña'} es requerido`;
      }
      if (field.errors['email']) {
        return 'Email inválido';
      }
      if (field.errors['minlength']) {
        return 'La contraseña debe tener al menos 6 caracteres';
      }
    }
    return '';
  }
}