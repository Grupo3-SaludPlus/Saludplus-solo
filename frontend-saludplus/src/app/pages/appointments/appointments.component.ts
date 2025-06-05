import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DoctorsService, Doctor } from '../../services/doctors.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
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

  specialties: string[] = [];
  availableDoctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  availableDates: string[] = [];
  selectedDate: string = '';
  availableHours: string[] = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '12:00', '14:00', '14:30', '15:00', '15:30', 
    '16:00', '16:30', '17:00', '17:30'
  ];
  
  constructor(
    private doctorsService: DoctorsService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit() {
    // Cargar médicos desde el servicio
    this.doctorsService.getDoctors().subscribe(doctors => {
      this.availableDoctors = doctors;
      
      // Extraer especialidades únicas de los médicos
      this.specialties = [...new Set(doctors.map(doctor => doctor.specialty))];
      
      // Verificar parámetros de consulta para preseleccionar médico
      this.checkQueryParams();
    });
    
    // Generar fechas disponibles (próximos 15 días, excluyendo domingos)
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
  
  // Método para verificar si hay parámetros de consulta
  checkQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['doctorId'] && params['specialty']) {
        // Preseleccionar especialidad
        this.appointmentForm.specialty = params['specialty'];
        
        // Avanzar al paso 2
        this.currentStep = 2;
        
        // Filtrar médicos por especialidad
        this.filteredDoctors = this.availableDoctors.filter(
          doctor => doctor.specialty === params['specialty']
        );
        
        // Seleccionar el médico específico si existe
        if (params['doctorName']) {
          this.appointmentForm.doctor = params['doctorName'];
          
          // Automáticamente avanzar al paso 3 (fecha y hora)
          setTimeout(() => this.currentStep = 3, 300);
        }
      }
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
        // Filtrar médicos por especialidad seleccionada
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
    // Aquí integrarías con el servicio para guardar la cita
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

  // Método para seleccionar una especialidad de forma controlada
  selectSpecialty(specialty: string): void {
    this.appointmentForm.specialty = specialty;
    // Forzar la detección de cambios si es necesario
    // this.cd.detectChanges(); // Necesitarías inyectar ChangeDetectorRef
  }

  // Método para obtener el icono apropiado
  getSpecialtyIcon(specialty: string): any {
    const iconMap: {[key: string]: boolean} = {
      'fa-baby': specialty === 'Pediatría',
      'fa-heartbeat': specialty === 'Cardiología',
      'fa-brain': specialty === 'Neurología',
      'fa-bone': specialty === 'Traumatología',
      'fa-allergies': specialty === 'Dermatología',
      'fa-eye': specialty === 'Oftalmología',
      'fa-stethoscope': specialty === 'Medicina General',
      'fa-comments': specialty === 'Psiquiatría',
      'fa-venus': specialty === 'Ginecología y Obstetricia',
      'fa-pills': specialty === 'Endocrinología',
      'fa-notes-medical': specialty === 'Gastroenterología',
      'fa-dna': specialty === 'Oncología',
      'fa-procedures': specialty === 'Urología',
      'fa-lungs': specialty === 'Neumología',
      'fa-tooth': specialty === 'Odontología'
    };
    
    // Añadir siempre fa-user-md como respaldo
    return {...iconMap, 'fa-user-md': true};
  }
}
