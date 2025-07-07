import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service'; // importa el servicio

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  currentStep = 1;
  showConfirmationModal = false;
  isLoggedIn = false;
  currentUserName = '';
  
  title = 'Agenda tu Cita Médica';
  subtitle = 'Reserva tu consulta médica de forma rápida y sencilla';
  
  appointmentForm = {
    specialty: '',
    doctor: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  specialties = [
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Neurología',
    'Pediatría',
    'Ginecología',
    'Traumatología'
  ];

  doctors: any[] = [];
  currentMonth = new Date();
  
  availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  constructor(
    private apiService: ApiService, // inyecta el ApiService
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.loadDoctors();
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    
    this.isLoggedIn = !!token;
    this.currentUserName = userName || '';
  }

  loadDoctors() {
    console.log('🔄 Cargando doctores...');
    
    this.apiService.getDoctors().subscribe({
      next: (doctors) => {
        console.log('✅ Doctores recibidos del backend:', doctors);
        
        this.doctors = [
          { name: 'Cualquier médico disponible', specialty: 'General', id: null },
          ...doctors
        ];
        
        console.log('📋 Lista final de doctores:', this.doctors);
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error al cargar doctores:', error);
        console.log('🔄 Usando doctores de fallback...');
        
        // Fallback con más doctores de ejemplo
        this.doctors = [
          { name: 'Cualquier médico disponible', specialty: 'General', id: null },
          { name: 'Dr. Juan Pérez', specialty: 'Cardiología', id: 1 },
          { name: 'Dra. María González', specialty: 'Dermatología', id: 2 },
          { name: 'Dr. Carlos López', specialty: 'Neurología', id: 3 },
          { name: 'Dra. Ana Martínez', specialty: 'Pediatría', id: 4 },
          { name: 'Dr. Luis Rodríguez', specialty: 'Medicina General', id: 5 }
        ];
        
        console.log('📋 Doctores de fallback cargados:', this.doctors);
        this.cd.detectChanges();
      }
    });
  }

  get filteredDoctors() {
    console.log('🔍 Filtrando doctores por especialidad:', this.appointmentForm.specialty);
    console.log('👥 Doctores disponibles:', this.doctors);
    
    if (!this.appointmentForm.specialty) {
      console.log('📝 No hay especialidad seleccionada, mostrando todos');
      return this.doctors;
    }
    
    const filtered = this.doctors.filter(doctor => 
      doctor.name === 'Cualquier médico disponible' || 
      doctor.specialty === this.appointmentForm.specialty
    );
    
    console.log('✨ Doctores filtrados:', filtered);
    return filtered;
  }

  // Métodos de navegación
  isCurrentStep(step: number): boolean {
    return this.currentStep === step;
  }

  canAdvance(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!this.appointmentForm.specialty;
      case 2:
        return !!this.appointmentForm.doctor;
      case 3:
        return !!this.appointmentForm.date && !!this.appointmentForm.time;
      case 4:
        if (this.isLoggedIn) {
          return true;
        } else {
          return !!(this.appointmentForm.name && this.appointmentForm.email && this.appointmentForm.phone);
        }
      default:
        return false;
    }
  }

  nextStep() {
    if (this.canAdvance() && this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Métodos de selección
  selectSpecialty(specialty: string) {
    this.appointmentForm.specialty = specialty;
    this.appointmentForm.doctor = ''; // Reset doctor cuando cambia especialidad
  }

  selectDoctor(doctor: string) {
    this.appointmentForm.doctor = doctor;
  }

  selectDate(date: string) {
    this.appointmentForm.date = date;
    this.appointmentForm.time = ''; // Reset time cuando cambia fecha
  }

  selectTime(time: string) {
    this.appointmentForm.time = time;
  }

  // Métodos para iconos
  getSpecialtyIcon(specialty: string): string {
    const icons: { [key: string]: string } = {
      'Medicina General': 'fa-user-md',
      'Cardiología': 'fa-heartbeat',
      'Dermatología': 'fa-hand-paper',
      'Neurología': 'fa-brain',
      'Pediatría': 'fa-baby',
      'Ginecología': 'fa-venus',
      'Traumatología': 'fa-bone'
    };
    return icons[specialty] || 'fa-stethoscope';
  }

  // Métodos para el calendario
  getCurrentMonthName(): string {
    return this.currentMonth.toLocaleDateString('es-ES', { month: 'long' });
  }

  getCurrentYear(): number {
    return this.currentMonth.getFullYear();
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
  }

  getAvailableDates(): string[] {
    const dates = [];
    const today = new Date();
    const startDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const endDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      if (date >= today && !this.isWeekend(date.toISOString().split('T')[0])) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  }

  isToday(dateString: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  }

  isWeekend(dateString: string): boolean {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  isPastDate(dateString: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateString < today;
  }

  getDateNumber(dateString: string): string {
    const date = new Date(dateString);
    return date.getDate().toString();
  }

  getDayName(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  }

  formatSelectedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getMorningTimes(): string[] {
    return this.availableTimes.filter(time => time < '13:00');
  }

  getAfternoonTimes(): string[] {
    return this.availableTimes.filter(time => time >= '13:00');
  }

  // Envío del formulario
  submitAppointment() {
    if (!this.canAdvance()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const appointmentData = {
      specialty: this.appointmentForm.specialty,
      doctor: this.appointmentForm.doctor,
      date: this.appointmentForm.date,
      time: this.appointmentForm.time,
      message: this.appointmentForm.message || '',
      ...(this.isLoggedIn ? {} : {
        name: this.appointmentForm.name,
        email: this.appointmentForm.email,
        phone: this.appointmentForm.phone
      })
    };

    console.log('Enviando cita:', appointmentData);

    this.apiService.createAppointment(appointmentData).subscribe({
      next: (response: any) => {
        console.log('Cita creada exitosamente:', response);
        this.showConfirmationModal = true;
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Error al crear cita:', error);
        let errorMessage = 'Error al agendar la cita. Por favor intenta nuevamente.';
        
        if (error.error?.error) {
          errorMessage = error.error.error;
        }
        
        alert(errorMessage);
      }
    });
  }

  navigateToMyAppointments() {
    this.showConfirmationModal = false;
    if (this.isLoggedIn) {
      this.router.navigate(['/appointment-history']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  closeModal() {
    this.showConfirmationModal = false;
    // Reset form
    this.currentStep = 1;
    this.appointmentForm = {
      specialty: '',
      doctor: '',
      date: '',
      time: '',
      name: '',
      email: '',
      phone: '',
      message: ''
    };
  }

  // Método para obtener iniciales del doctor:
  getDoctorInitials(doctorName: string): string {
    if (doctorName.includes('Cualquier')) return '';
    
    return doctorName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
