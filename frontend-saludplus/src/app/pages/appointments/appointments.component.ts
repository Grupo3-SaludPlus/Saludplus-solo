import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DoctorsService} from '../../services/doctors.service';
import { Doctor } from '../../services/api.service';
import { AuthService} from '../../services/auth.service';
import { User } from '../../services/api.service';// Cambiar esta línea
import { SharedAppointmentsService, AppointmentBase } from '../../services/shared-appointments.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit, OnDestroy {
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
  
  // Agregar estas propiedades
  isLoggedIn = false;
  currentUserName = '';

  // Añadir esta propiedad a la clase
  showConfirmationModal: boolean = false;

  calendarMonth: Date = new Date();
  calendarDays: { date: Date, label: number | string, available: boolean, isToday: boolean }[] = [];

  // Nueva propiedad para el usuario actual
  currentUser: User | null = null;
  appointments: AppointmentBase[] = [];
  filteredAppointments: AppointmentBase[] = [];
  
  // Suscripciones
  private userSubscription?: Subscription;
  private appointmentsSubscription?: Subscription;

  constructor(
    private doctorsService: DoctorsService,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentsService: SharedAppointmentsService,
    private authService: AuthService,
    // Add ChangeDetectorRef
    private cd: ChangeDetectorRef 
  ) {
    // Initialize showConfirmationModal explicitly
    this.showConfirmationModal = false;
  }
  
  ngOnInit() {
    // Cargar médicos desde el servicio
    this.doctorsService.getAllDoctors().subscribe(doctors => {
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
    
    // Verificar si el usuario está autenticado
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.isLoggedIn = true;
        this.currentUserName = user.name;
        
        // Pre-llenar los campos del formulario con los datos del usuario
        this.appointmentForm.name = user.name;
        this.appointmentForm.email = user.email || '';
        this.appointmentForm.phone = user.phone || '';
        
        // Cargar citas del usuario
        this.loadUserAppointments();
      } else {
        this.isLoggedIn = false;
        this.currentUserName = '';
      }
    });

    this.generateCalendar();

    // Suscribirse a los cambios del usuario
    this.userSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.loadUserAppointments();
      }
    });
  }
  
  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.appointmentsSubscription?.unsubscribe();
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
    // Validar según el paso actual
    if (this.currentStep === 1) {
      // Para el paso 1, solo necesitamos que haya seleccionado una especialidad
      return !!this.appointmentForm.specialty;
    } 
    else if (this.currentStep === 2) {
      // Para el paso 2, necesitamos que haya seleccionado un doctor
      return !!this.appointmentForm.doctor;
    } 
    else if (this.currentStep === 3) {
      // Para el paso 3, necesitamos fecha y hora
      return !!this.appointmentForm.date && !!this.appointmentForm.time;
    }
    else if (this.currentStep === 4) {
      if (this.isLoggedIn) {
        // Si está logueado, solo verificamos que el resumen esté completo
        return !!this.appointmentForm.specialty && 
               !!this.appointmentForm.doctor && 
               !!this.appointmentForm.date && 
               !!this.appointmentForm.time;
      } else {
        // Si no está logueado, necesitamos todos los campos
        return !!this.appointmentForm.name && 
               !!this.appointmentForm.email && 
               !!this.appointmentForm.phone &&
               !!this.appointmentForm.specialty && 
               !!this.appointmentForm.doctor && 
               !!this.appointmentForm.date && 
               !!this.appointmentForm.time;
      }
    }
    
    // Por defecto, si el paso no está definido
    return false;
  }
  
  submitAppointment(): void {
    // Validar campos según si está logueado o no
    if (!this.isLoggedIn) {
      // Si no está logueado, verificar campos obligatorios
      if (!this.appointmentForm.name || !this.appointmentForm.email || !this.appointmentForm.phone) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }
      
      // Procesar cita para usuario no logueado
      const doctorId = this.availableDoctors.find(
        d => d.name === this.appointmentForm.doctor
      )?.id || 0;
      
      // Usar ID genérico para usuarios no autenticados
      const newAppointment = this.appointmentsService.createAppointment({
        patientId: 9999, // ID provisional para usuarios no logueados
        patientName: this.appointmentForm.name,
        doctorId: doctorId,
        doctorName: this.appointmentForm.doctor,
        specialty: this.appointmentForm.specialty,
        date: this.appointmentForm.date,
        time: this.appointmentForm.time,
        status: 'scheduled',
        reason: this.appointmentForm.message || '',
        location: 'Centro Médico SaludPlus'
        // El servicio agregará automáticamente el guestId
      });
      
      console.log('Cita guardada (usuario no logueado):', newAppointment);
    } 
    else {
      // El código existente para usuarios logueados
      const currentUser = this.authService.currentUserValue;
      
      if (!currentUser) {
        console.error('Error: Usuario aparece como logueado pero no hay datos de usuario');
        alert('Error al procesar su información. Por favor, vuelva a iniciar sesión');
        return;
      }
      
      const doctorId = this.availableDoctors.find(
        d => d.name === this.appointmentForm.doctor
      )?.id || 0;
      
      // Extraer correctamente el ID numérico del paciente
      let patientId: number;
      
      // Si el ID tiene formato "patient-XXX", extraer el número
      let idStr: string = typeof currentUser.id === 'number' ? currentUser.id.toString() : (currentUser.id || '');
      if (idStr.includes('-')) {
        const parts = idStr.split('-');
        patientId = parseInt(parts[1], 10);
      } else {
        // Si es un ID simple, intentar convertirlo directamente
        patientId = parseInt(idStr, 10);
      }
      
      // Verificar que el patientId sea válido
      if (isNaN(patientId)) {
        console.error('ID de paciente inválido:', currentUser.id);
        alert('Error al procesar el ID de usuario. Por favor, inicie sesión nuevamente.');
        return;
      }

      // Crear la cita con el ID correcto
      const newAppointment = this.appointmentsService.createAppointment({
        patientId: patientId,
        patientName: currentUser.name,
        doctorId: doctorId,
        doctorName: this.appointmentForm.doctor,
        specialty: this.appointmentForm.specialty,
        date: this.appointmentForm.date,
        time: this.appointmentForm.time,
        status: 'scheduled',
        reason: this.appointmentForm.message || '',
        location: 'Centro Médico SaludPlus'
      });
      
      console.log('Cita guardada (usuario logueado):', newAppointment);
    }
    
    // Mostrar modal de confirmación (para ambos casos)
    console.log('About to show modal');
    setTimeout(() => {
      this.showConfirmationModal = true;
      console.log('Modal should be visible now:', this.showConfirmationModal);
      this.cd.detectChanges();
    }, 0);
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

  // Añadir este nuevo método para cerrar el modal y navegar
  navigateToMyAppointments(): void {
    console.log('Navigating to appointments page');
    // Hide modal first
    this.showConfirmationModal = false;
    this.cd.detectChanges();
    
    // Navigate after a short delay
    setTimeout(() => {
      this.router.navigate(['/my-appointments']);
    }, 100);
  }

  generateCalendar() {
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: any[] = [];
    
    // Días del mes anterior
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({
        date: prevDate,
        label: prevDate.getDate(),
        available: false,
        isToday: false,
        isCurrentMonth: false
      });
    }
    
    // Días del mes actual
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const available = this.availableDates
        ? this.availableDates.some(av =>
            new Date(av).toDateString() === date.toDateString()
          )
        : true;
      const isToday = new Date().toDateString() === date.toDateString();
      days.push({ 
        date, 
        label: d, 
        available, 
        isToday,
        isCurrentMonth: true
      });
    }
    
    // Días del mes siguiente para completar la cuadrícula
    const daysNeeded = 42 - days.length; // 6 filas x 7 columnas = 42
    for (let i = 1; i <= daysNeeded; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        label: i,
        available: false,
        isToday: false,
        isCurrentMonth: false
      });
    }
    
    this.calendarDays = days;
  }

  prevMonth() {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  // Método para cargar las citas del usuario
  private loadUserAppointments() {
    const currentUser = this.currentUser;
    if (!currentUser) return;

    this.appointmentsService.getAllAppointments().subscribe((allAppointments: AppointmentBase[]) => {
      this.appointments = allAppointments.filter((apt: AppointmentBase) => 
        apt.patientName === currentUser.name
      );
      this.filteredAppointments = [...this.appointments];
    });
  }
}
