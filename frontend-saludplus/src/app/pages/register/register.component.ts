import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Registro de Paciente</h2>
        
        <form (ngSubmit)="register()" #registerForm="ngForm">
          <div class="form-group">
            <input
              [(ngModel)]="formData.name"
              name="name"
              placeholder="Nombre completo"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <input
              [(ngModel)]="formData.email"
              name="email"
              type="email"
              placeholder="Email"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <input
              [(ngModel)]="formData.password"
              name="password"
              type="password"
              placeholder="Contraseña"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <input
              [(ngModel)]="formData.phone"
              name="phone"
              placeholder="Teléfono"
              class="form-input"
              required
            />
          </div>
          <button 
            type="submit" 
            class="btn-register"
            [disabled]="!registerForm.form.valid || isLoading"
          >
            {{ isLoading ? 'Registrando...' : 'Registrarse como Paciente' }}
          </button>
        </form>

        <div class="login-link">
          <p>¿Ya tienes cuenta? <a href="/login">Iniciar sesión</a></p>
        </div>

        <!-- Resultado -->
        <div *ngIf="result" class="result" [ngClass]="{
          'success': isSuccess,
          'error': !isSuccess
        }">
          {{ result }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #20b2aa 0%, #009688 100%);
      padding: 20px;
    }

    .register-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 450px;
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
      font-size: 28px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e1e1;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #20b2aa;
    }

    .btn-register {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #20b2aa 0%, #009688 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-register:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .btn-register:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-link {
      text-align: center;
      margin-top: 20px;
    }

    .login-link a {
      color: #20b2aa;
      text-decoration: none;
    }

    .result {
      margin-top: 20px;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    }

    .result.success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .result.error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #555;
    }
  `]
})
export class RegisterComponent {
  isLoading = false;
  result = '';
  isSuccess = false;

  formData = {
    name: '',
    email: '',
    password: '',
    phone: '',
    birthdate: '',
    role: 'patient' // Fijo para pacientes
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  register() {
    this.isLoading = true;
    
    // Preparar datos para envío
    const registrationData = {
      ...this.formData,
      email: this.formData.email.trim().toLowerCase()
    };

    this.http.post('http://localhost:8000/api/auth/register/', registrationData)
      .subscribe({
        next: (response: any) => {
          this.showSuccess('¡Registro exitoso! Redirigiendo al login...');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          if (error.status === 400 && error.error?.error) {
            this.showError(error.error.error);
          } else {
            this.showError('Error en el registro. Por favor intenta nuevamente.');
          }
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  private showSuccess(message: string) {
    this.result = message;
    this.isSuccess = true;
  }

  private showError(message: string) {
    this.result = message;
    this.isSuccess = false;
  }
}