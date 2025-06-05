import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

const API_URL = 'http://localhost:4200/assets/mock-api'; // URL para datos mock locales

interface PatientProfile {
  id?: number;
  name: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
}

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <h2 class="mb-4">Mi Perfil</h2>
      
      <div *ngIf="loading" class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
      
      <div *ngIf="error" class="alert alert-danger">
        {{ errorMessage }}
      </div>
      
      <div *ngIf="!loading && !error" class="card">
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-6">
              <h3>{{ profile.name }} {{ profile.lastName }}</h3>
              <p><strong>Email:</strong> {{ profile.email }}</p>
              <p *ngIf="profile.phoneNumber"><strong>Teléfono:</strong> {{ profile.phoneNumber }}</p>
              <p *ngIf="profile.dateOfBirth"><strong>Fecha de nacimiento:</strong> {{ profile.dateOfBirth | date:'dd/MM/yyyy' }}</p>
              <p *ngIf="profile.address"><strong>Dirección:</strong> {{ profile.address }}</p>
            </div>
            <div class="col-md-6">
              <h4 class="mb-3">Información médica</h4>
              <p *ngIf="profile.bloodType"><strong>Tipo de sangre:</strong> {{ profile.bloodType }}</p>
              <div *ngIf="profile.allergies">
                <strong>Alergias:</strong>
                <p>{{ profile.allergies }}</p>
              </div>
              <div *ngIf="profile.medicalHistory">
                <strong>Historia médica:</strong>
                <p>{{ profile.medicalHistory }}</p>
              </div>
            </div>
          </div>

          <button class="btn btn-primary" (click)="editMode = !editMode">
            {{ editMode ? 'Cancelar' : 'Editar perfil' }}
          </button>

          <div *ngIf="editMode" class="mt-4">
            <form (ngSubmit)="updateProfile()">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="name" class="form-label">Nombre</label>
                  <input type="text" class="form-control" id="name" [(ngModel)]="profile.name" name="name" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="lastName" class="form-label">Apellido</label>
                  <input type="text" class="form-control" id="lastName" [(ngModel)]="profile.lastName" name="lastName" required>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="phone" class="form-label">Teléfono</label>
                <input type="tel" class="form-control" id="phone" [(ngModel)]="profile.phoneNumber" name="phoneNumber">
              </div>
              
              <div class="mb-3">
                <label for="dateOfBirth" class="form-label">Fecha de nacimiento</label>
                <input type="date" class="form-control" id="dateOfBirth" [(ngModel)]="profile.dateOfBirth" name="dateOfBirth">
              </div>
              
              <div class="mb-3">
                <label for="address" class="form-label">Dirección</label>
                <textarea class="form-control" id="address" [(ngModel)]="profile.address" name="address" rows="2"></textarea>
              </div>
              
              <div class="mb-3">
                <label for="bloodType" class="form-label">Tipo de sangre</label>
                <select class="form-select" id="bloodType" [(ngModel)]="profile.bloodType" name="bloodType">
                  <option value="">Seleccione</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label for="allergies" class="form-label">Alergias</label>
                <textarea class="form-control" id="allergies" [(ngModel)]="profile.allergies" name="allergies" rows="3"></textarea>
              </div>
              
              <div class="mb-3">
                <label for="medicalHistory" class="form-label">Historia médica</label>
                <textarea class="form-control" id="medicalHistory" [(ngModel)]="profile.medicalHistory" name="medicalHistory" rows="3"></textarea>
              </div>
              
              <button type="submit" class="btn btn-success" [disabled]="updating">
                <span *ngIf="updating" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Guardar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .card {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  `]
})
export class PatientProfileComponent implements OnInit {
  profile: PatientProfile = {
    name: '',
    lastName: '',
    email: ''
  };
  loading = true;
  error = false;
  errorMessage = '';
  editMode = false;
  updating = false;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadProfile();
  }
  
  loadProfile(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = true;
      this.errorMessage = 'No se pudo identificar el usuario. Por favor inicie sesión nuevamente.';
      this.loading = false;
      return;
    }
    
    this.http.get<PatientProfile>(`${API_URL}/patients/${userId}/profile`)
      .subscribe({
        next: (data) => {
          this.profile = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando perfil:', err);
          this.loading = false;
          this.error = true;
          this.errorMessage = 'No se pudo cargar la información del perfil. Por favor intente más tarde.';
          
          // SOLUCIÓN TEMPORAL: Cargar datos de prueba si la API falla
          this.loadMockData(userId);
        }
      });
  }
  
  loadMockData(userId: string): void {
    // Datos mock para prueba
    this.profile = {
      name: this.authService.currentUserValue?.name?.split(' ')[0] || 'Usuario',
      lastName: this.authService.currentUserValue?.name?.split(' ').slice(1).join(' ') || 'Prueba',
      email: this.authService.currentUserValue?.email || 'usuario@ejemplo.com',
      phoneNumber: this.authService.currentUserValue?.phone || '+56912345678',
      dateOfBirth: this.authService.currentUserValue?.dateOfBirth || '1990-01-01',
      address: 'Av. Ejemplo 123, Santiago',
      bloodType: 'O+',
      allergies: 'Ninguna conocida',
      medicalHistory: 'Sin antecedentes médicos relevantes'
    };
    
    this.loading = false;
    this.error = false;
    this.errorMessage = '';
    
    // Mostrar mensaje informativo
    console.info('Usando datos de prueba para el perfil');
  }
  
  updateProfile(): void {
    this.updating = true;
    const userId = this.authService.getUserId();
    
    this.http.put<PatientProfile>(`${API_URL}/patients/${userId}/profile`, this.profile)
      .subscribe({
        next: (data) => {
          this.profile = data;
          this.updating = false;
          this.editMode = false;
          // Mostrar mensaje de éxito (se podría implementar un toast/alerta)
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          this.updating = false;
          // Mostrar mensaje de error
        }
      });
  }
}