import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="success-container">
      <div class="success-card">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        
        <h1>¡Registro Exitoso!</h1>
        <p>Tu cuenta ha sido creada correctamente</p>
        
        <div class="user-details">
          <div class="detail-row">
            <span class="label">Nombre:</span>
            <span class="value">{{ currentUser?.name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Email:</span>
            <span class="value">{{ currentUser?.email }}</span>
          </div>
          <div class="detail-row">
            <span class="label">ID de Usuario:</span>
            <span class="value">{{ currentUser?.id }}</span>
          </div>
        </div>
        
        <div class="actions">
          <a routerLink="/patient/dashboard" class="btn-primary">Ir a mi Dashboard</a>
          <a routerLink="/patient/profile" class="btn-secondary">Completar mi Perfil</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f9fafb;
      padding: 20px;
    }
    
    .success-card {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      padding: 40px;
      width: 100%;
      max-width: 500px;
      text-align: center;
    }
    
    .success-icon {
      font-size: 72px;
      color: #22c55e;
      margin-bottom: 20px;
    }
    
    h1 {
      color: #111827;
      margin-bottom: 10px;
    }
    
    p {
      color: #6b7280;
      margin-bottom: 30px;
    }
    
    .user-details {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      text-align: left;
    }
    
    .detail-row {
      display: flex;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .detail-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    
    .label {
      font-weight: 600;
      width: 120px;
      color: #374151;
    }
    
    .value {
      color: #111827;
      flex: 1;
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .btn-primary, .btn-secondary {
      padding: 12px 20px;
      border-radius: 6px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background-color: #2563eb;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #1d4ed8;
    }
    
    .btn-secondary {
      background-color: #e5e7eb;
      color: #374151;
    }
    
    .btn-secondary:hover {
      background-color: #d1d5db;
    }
  `]
})
export class RegisterSuccessComponent {
  currentUser: any;
  
  constructor(private authService: AuthService) {
    this.currentUser = this.authService.currentUserValue;
  }
}