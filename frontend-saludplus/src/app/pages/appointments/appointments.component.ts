import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Doctor {
  name: string;
  specialty: string;
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit {
  title = 'Agenda tu Hora Médica';
  subtitle = 'Programa una cita con nuestros profesionales en simples pasos';
  
  currentStep = 1;
  totalSteps = 4;
  
  appointmentForm = {
    name: '',
    email: '',
    phone: '',
    specialty: '',
    doctor: '',
    date: '',
    time: '',
    message: ''
  };

  specialties = [
    'Cardiología',
    'Neurología',
    'Traumatología',
    'Pediatría',
    'Dermatología',
    'Oftalmología',
    'Medicina General',
    'Kinesiología',
    'Psiquiatría / Psicología'
  ];
  
  availableDoctors: Doctor[] = [
    { name: 'Dra. Carla Mendoza', specialty: 'Cardiología' },
    { name: 'Dr. Roberto Fuentes', specialty: 'Neurología' },
    { name: 'Dra. Valentina Torres', specialty: 'Pediatría' },
    { name: 'Dr. Andrés Soto', specialty: 'Traumatología' },
    { name: 'Dra. María López', specialty: 'Dermatología' },
    { name: 'Dr. Juan Pérez', specialty: 'Medicina General' }
  ];
  
  availableHours: string[] = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '12:00', '14:00', '14:30', '15:00', '15:30', 
    '16:00', '16:30', '17:00', '17:30'
  ];
  
  filteredDoctors: Doctor[] = [];
  availableDates: string[] = [];
  selectedDate: string = '';
  
  ngOnInit() {
    // Generar fechas disponibles (proximos 15 días, excluyendo domingos)
    const today = new Date();
    this.availableDates = Array(15).fill(null).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i + 1); // +1 para empezar mañana
      
      // Si es domingo (0), sumar un día más
      if (date.getDay() === 0) {
        date.setDate(date.getDate() + 1);
      }
      
      return this.formatDate(date);
    });
  }
  
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      
      if (this.currentStep === 2) {
        this.filteredDoctors = this.availableDoctors.filter(
          doctor => doctor.specialty === this.appointmentForm.specialty
        );
        
        // Si no hay médicos para esta especialidad
        if (this.filteredDoctors.length === 0) {
          this.appointmentForm.doctor = 'Cualquier especialista disponible';
        }
      }
    }
  }
  
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  
  selectDate(date: string) {
    this.selectedDate = date;
    this.appointmentForm.date = date;
  }
  
  selectHour(hour: string) {
    this.appointmentForm.time = hour;
  }
  
  isCurrentStep(step: number): boolean {
    return this.currentStep === step;
  }
  
  canAdvance(): boolean {
    switch(this.currentStep) {
      case 1: 
        return !!this.appointmentForm.specialty;
      case 2:
        return !!this.appointmentForm.doctor;
      case 3:
        return !!this.appointmentForm.date && !!this.appointmentForm.time;
      case 4:
        return !!this.appointmentForm.name && !!this.appointmentForm.email && !!this.appointmentForm.phone;
      default:
        return false;
    }
  }
  
  submitAppointment() {
    console.log('Formulario enviado:', this.appointmentForm);
    alert('¡Tu solicitud ha sido recibida! Te contactaremos pronto para confirmar tu cita.');
    
    // Resetear formulario y volver al primer paso
    this.appointmentForm = {
      name: '',
      email: '',
      phone: '',
      specialty: '',
      doctor: '',
      date: '',
      time: '',
      message: ''
    };
    
    this.currentStep = 1;
  }
}
