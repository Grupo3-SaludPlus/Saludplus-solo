import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registro-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-medico.component.html',
  styleUrls: ['./registro-medico.component.css']
})
export class RegistroMedicoComponent {
  doctorData = {
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    phone: '',
    birthdate: '',
    specialty: ''
  };
  specialties = [
    { key: 'general',     label: 'Medicina General' },
    { key: 'cardiology',  label: 'Cardiología' },
    { key: 'neurology',   label: 'Neurología' },
    { key: 'pediatrics',  label: 'Pediatría' },
    { key: 'psychiatry',  label: 'Psiquiatría' },
    { key: 'orthopedics', label: 'Traumatología' },
    { key: 'dermatology', label: 'Dermatología' },
    { key: 'gynecology',  label: 'Ginecología' },
  ];
  recommendedEmail = '';
  result = '';
  useGenericPassword = false;

  constructor(private http: HttpClient) {}

  updateEmail() {
    const parts = this.doctorData.name.trim().toLowerCase().split(/\s+/);
    if (!parts[0]) {
      this.recommendedEmail = '';
      return;
    }
    const first = parts[0];
    const last = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    this.recommendedEmail = `${first}.${last}@saludplus.com`;
  }

  selectRecommended(event: MouseEvent) {
    event.preventDefault();
    this.doctorData.email = this.recommendedEmail;
  }

  toggleGenericPassword() {
    if (this.useGenericPassword) {
      this.doctorData.password = 'doctor123';
    } else {
      this.doctorData.password = '';
    }
  }

  normalizeEmail() {
    if (this.doctorData.email) {
      this.doctorData.email =
        this.doctorData.email.trim().toLowerCase();
    }
  }

  registerDoctor() {
    // 1) Normalizar email
    this.normalizeEmail();

    // 2) Lanzar petición
    this.http
      .post('http://localhost:8000/api/auth/register/', this.doctorData)
      .subscribe({
        next: (res) => {
          this.result = `✅ Éxito:\n${JSON.stringify(res, null, 2)}`;
        },
        error: (err) => {
          // 3) Si el back devuelve 400 y un mensaje de “email ya registrado”
          if (err.status === 400 && err.error?.error) {
            this.result = `❌ ${err.error.error}`;
          } else {
            this.result = `❌ Error inesperado:\n${JSON.stringify(err.error, null, 2)}`;
          }
        },
      });
  }
}