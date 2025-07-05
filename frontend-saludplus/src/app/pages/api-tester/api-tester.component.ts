import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-api-tester',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './api-tester.component.html',
  styleUrls: ['./api-tester.component.css']
})
export class ApiTesterComponent implements OnInit {
  registerData = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    password: '123456',
    role: 'patient',
    phone: '+56912345678',
    birthdate: '1990-01-01'
  };

  loginData = {
    email: 'juan@example.com',
    password: '123456'
  };

  // ✅ CAMBIAR: Usar nombres en lugar de IDs
  appointmentData = {
    patient_name: '',     // Será rellenado automáticamente
    doctor_name: '',      // Será rellenado automáticamente
    date: '2025-07-04',
    time: '12:30',
    reason: 'Consulta general',
    priority: 'medium'
  };

  registerResult = '';
  loginResult = '';
  appointmentResult = '';
  responseHistory: any[] = [];

  // ✅ Listas para los selectores
  patients: any[] = [];
  doctors: any[] = [];
  isLoadingData = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPatientsAndDoctors();
  }

  // ✅ Cargar pacientes y doctores
  loadPatientsAndDoctors() {
    this.isLoadingData = true;
    console.log('🔍 Cargando pacientes y doctores...');
    
    // Cargar pacientes
    this.http.get('http://localhost:8000/api/patients/').subscribe({
      next: (patients: any) => {
        console.log('✅ Pacientes cargados:', patients);
        this.patients = Array.isArray(patients) ? patients : [];
        if (this.patients.length > 0) {
          this.appointmentData.patient_name = this.patients[0].name;
        }
        console.log(`📊 Total pacientes: ${this.patients.length}`);
      },
      error: (error) => {
        console.error('❌ Error cargando pacientes:', error);
        this.patients = [];
      }
    });

    // Cargar doctores
    this.http.get('http://localhost:8000/api/doctors/').subscribe({
      next: (doctors: any) => {
        console.log('✅ Doctores cargados:', doctors);
        this.doctors = Array.isArray(doctors) ? doctors : [];
        if (this.doctors.length > 0) {
          this.appointmentData.doctor_name = this.doctors[0].name;
        }
        console.log(`📊 Total doctores: ${this.doctors.length}`);
        this.isLoadingData = false;
      },
      error: (error) => {
        console.error('❌ Error cargando doctores:', error);
        this.doctors = [];
        this.isLoadingData = false;
      }
    });
  }

  testRegister() {
    const url = 'http://localhost:8000/api/auth/register/';
    this.http.post(url, this.registerData).subscribe({
      next: (response) => {
        this.registerResult = `✅ ÉXITO:\n${JSON.stringify(response, null, 2)}`;
        this.addToHistory('POST', url, 200, response, 'success');
        // Recargar listas después del registro
        this.loadPatientsAndDoctors();
      },
      error: (error) => {
        this.registerResult = `❌ ERROR:\n${JSON.stringify(error.error, null, 2)}`;
        this.addToHistory('POST', url, error.status, error.error, 'error');
      }
    });
  }

  testLogin() {
    const url = 'http://localhost:8000/api/auth/login/';
    const loginData = {
      email: this.loginData.email,
      password: this.loginData.password
    };
    
    this.http.post(url, loginData).subscribe({
      next: (response) => {
        this.loginResult = `✅ ÉXITO:\n${JSON.stringify(response, null, 2)}`;
        this.addToHistory('POST', url, 200, response, 'success');
      },
      error: (error) => {
        this.loginResult = `❌ ERROR:\n${JSON.stringify(error.error, null, 2)}`;
        this.addToHistory('POST', url, error.status, error.error, 'error');
      }
    });
  }

  // ✅ MEJORADO: Convertir nombres a IDs y validar
  testCreateAppointment() {
    const url = 'http://localhost:8000/api/appointments/';
    
    console.log('🔍 Datos actuales del formulario:', this.appointmentData);
    console.log('👥 Pacientes disponibles:', this.patients);
    console.log('👨‍⚕️ Doctores disponibles:', this.doctors);
    
    // Validar que hay datos
    if (this.patients.length === 0) {
      this.appointmentResult = `❌ ERROR: No hay pacientes registrados. Registra un paciente primero.`;
      return;
    }
    
    if (this.doctors.length === 0) {
      this.appointmentResult = `❌ ERROR: No hay doctores registrados. Registra un doctor primero.`;
      return;
    }
    
    // Validar selecciones
    if (!this.appointmentData.patient_name) {
      this.appointmentResult = `❌ ERROR: Selecciona un paciente`;
      return;
    }
    
    if (!this.appointmentData.doctor_name) {
      this.appointmentResult = `❌ ERROR: Selecciona un doctor`;
      return;
    }
    
    // Buscar IDs por nombres
    const selectedPatient = this.patients.find(p => p.name === this.appointmentData.patient_name);
    const selectedDoctor = this.doctors.find(d => d.name === this.appointmentData.doctor_name);
    
    console.log('🔍 Paciente seleccionado:', selectedPatient);
    console.log('🔍 Doctor seleccionado:', selectedDoctor);
    
    if (!selectedPatient) {
      this.appointmentResult = `❌ ERROR: Paciente "${this.appointmentData.patient_name}" no encontrado en la lista`;
      return;
    }
    
    if (!selectedDoctor) {
      this.appointmentResult = `❌ ERROR: Doctor "${this.appointmentData.doctor_name}" no encontrado en la lista`;
      return;
    }

    // Crear datos con IDs para el backend
    const appointmentPayload = {
      patient_id: selectedPatient.id,
      doctor_id: selectedDoctor.id,
      date: this.appointmentData.date,
      time: this.appointmentData.time,
      reason: this.appointmentData.reason,
      priority: this.appointmentData.priority
    };

    console.log('📤 Enviando payload:', appointmentPayload);

    this.http.post(url, appointmentPayload).subscribe({
      next: (response) => {
        this.appointmentResult = `✅ ÉXITO:\n${JSON.stringify(response, null, 2)}`;
        this.addToHistory('POST', url, 201, response, 'success');
      },
      error: (error) => {
        this.appointmentResult = `❌ ERROR:\n${JSON.stringify(error.error, null, 2)}`;
        this.addToHistory('POST', url, error.status, error.error, 'error');
      }
    });
  }

  private addToHistory(method: string, url: string, status: number, body: any, statusClass: string) {
    this.responseHistory.unshift({
      method,
      url,
      status,
      body: JSON.stringify(body, null, 2),
      statusClass,
      timestamp: new Date().toLocaleTimeString()
    });
  }
}