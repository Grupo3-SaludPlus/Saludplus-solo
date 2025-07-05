import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../services/api.service';
import { DoctorsService } from '../../../services/doctors.service';
import { Doctor } from '../../../services/api.service';
import { NotificationService, Alert } from '../../services/notification.service';
import { AppointmentsService } from '../../../services/appointments.service';
import { Subscription } from 'rxjs';

// Define MedicalAppointment interface if not imported from a service
export interface MedicalAppointment {
  id: number;
  patientId?: number | string;
  patientName: string;
  patientAge?: number;
  doctorId: number;
  doctorName?: string;
  specialty: string;
  date: string;
  time: string;
  endTime?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  room?: string;
  reason?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'emergency';
  notes?: string;
  createdAt?: Date | string;
}

interface MedicalStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  monthlyRevenue: number;
  emergencyAlerts: number;
  activeSpecialties: number;
}

// Actualizar la interfaz PatientRecord
interface PatientRecord {
  id: string | number;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  phone: string;
  email: string;
  bloodType: string;
  insurance?: string; // AÑADIR ESTA PROPIEDAD
  emergencyContact?: string; // AÑADIR ESTA PROPIEDAD
  allergies: string[];
  chronic: string[];
  status: 'active' | 'inactive' | 'critical';
  lastVisit: string;
  totalVisits: number;
}

interface MedicalReport {
  id: number;
  title: string;
  type: 'patient-stats' | 'financial' | 'staff-performance' | 'medication-inventory' | 'equipment-status';
  date: string;
  summary: string;
  criticalItems?: number;
}

interface HospitalSettings {
  hospitalName: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  departments: string[];
  emergencyContact: string;
  visitingHours: {
    start: string;
    end: string;
  };
}

// Definición de MedicalStaff
interface MedicalStaff {
  id: number;
  name: string;
  specialty: string;
  license: string;
  isOnCall: boolean;
  currentPatients: number;
  email: string;
  phone: string;
  yearsExperience: number;
  department: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  showLogoutPopup = false;
  activeSection: 'dashboard' | 'appointments' | 'patients' | 'staff' | 'reports' | 'settings' = 'dashboard';
  
  // Estadísticas médicas
  medicalStats = {
    totalPatients: 0,
    totalDoctors: 12,
    activeSpecialties: 8,
    totalAppointments: 24,
    completedAppointments: 16,
    pendingAppointments: 8,
    // Añadir estas propiedades faltantes
    todayAppointments: 0,
    emergencyAlerts: 0,
    monthlyRevenue: 0
  };

  // Pacientes del sistema
  patientRecords: PatientRecord[] = [
    {
      id: 1,
      name: 'María Elena García',
      age: 45,
      gender: 'F',
      email: 'maria.garcia@email.com',
      phone: '+56 9 1234 5678',
      bloodType: 'O+',
      allergies: ['Penicilina', 'Mariscos'],
      chronic: ['Hipertensión'],
      lastVisit: '2024-01-18',
      totalVisits: 12,
      status: 'active',
      emergencyContact: 'Carlos García - +56 9 8765 4321'
    },
    {
      id: 2,
      name: 'Roberto Silva Martínez',
      age: 67,
      gender: 'M',
      email: 'roberto.silva@email.com',
      phone: '+56 9 2345 6789',
      bloodType: 'A-',
      allergies: ['Aspirina'],
      chronic: ['Diabetes Tipo 2', 'Artritis'],
      lastVisit: '2024-01-20',
      totalVisits: 28,
      status: 'critical',
      emergencyContact: 'Ana Silva - +56 9 7654 3210'
    },
    {
      id: 3,
      name: 'Carmen López Vega',
      age: 34,
      gender: 'F',
      email: 'carmen.lopez@email.com',
      phone: '+56 9 3456 7890',
      bloodType: 'B+',
      allergies: [],
      chronic: [],
      lastVisit: '2024-01-15',
      totalVisits: 5,
      status: 'active',
      emergencyContact: 'Luis López - +56 9 6543 2109'
    }
  ];

  // Personal médico
  medicalStaff: MedicalStaff[] = []; // Inicialización como array vacío

  // Citas médicas
  medicalAppointments: MedicalAppointment[] = [];
  private appointmentSubscription: Subscription | undefined;
  
  // Reportes médicos
  medicalReports: MedicalReport[] = [
    {
      id: 1,
      title: 'Estadísticas de Pacientes - Enero 2024',
      type: 'patient-stats',
      date: '2024-01-20',
      summary: 'Ingresos: 145 | Egresos: 132 | Ocupación: 87%',
      criticalItems: 3
    },
    {
      id: 2,
      title: 'Rendimiento del Personal Médico',
      type: 'staff-performance',
      date: '2024-01-18',
      summary: 'Satisfacción pacientes: 94% | Tiempo promedio consulta: 28 min',
      criticalItems: 0
    },
    {
      id: 3,
      title: 'Inventario de Medicamentos',
      type: 'medication-inventory',
      date: '2024-01-19',
      summary: 'Stock crítico: 12 medicamentos | Vencimientos próximos: 8',
      criticalItems: 12
    },
    {
      id: 4,
      title: 'Estado de Equipos Médicos',
      type: 'equipment-status',
      date: '2024-01-21',
      summary: 'Equipos funcionando: 98% | Mantenimiento pendiente: 3 equipos',
      criticalItems: 3
    }
  ];

  // Configuración hospitalaria
  hospitalSettings: HospitalSettings = {
    hospitalName: 'SaludPlus Centro Médico',
    address: 'Av. Providencia 1234, Santiago, Chile',
    phone: '+56 2 2345 6789',
    email: 'contacto@saludplus.com',
    capacity: 280,
    departments: ['Cardiología', 'Pediatría', 'Neurología', 'Ginecología', 'Traumatología', 'Medicina Interna', 'Urgencias', 'Cirugía General'],
    emergencyContact: '+56 2 2345 6700',
    visitingHours: {
      start: '14:00',
      end: '20:00'
    }
  };

  // Agregar un atributo para el doctor en edición
  editingDoctor: MedicalStaff | null = null;
  showDoctorModal = false;

  // Alertas
  showAlertsPopup = false;
  alerts: Alert[] = [];
  alertCount = 0;
  private alertsSubscription: Subscription | undefined;

  // Nuevo atributo para el ID del paciente expandido
  expandedPatientId: string | number | null = null;

  // Propiedad para controlar la vista de personal médico
  staffViewMode: 'table' | 'cards' = 'table';

  // Agregar estas propiedades a tu clase AdminDashboardComponent
  appointmentSearch: string = '';
  appointmentStatusFilter: string = 'all';
  appointmentDateFilter: string = 'all';
  selectedAppointment: MedicalAppointment | null = null;
  showAppointmentForm: boolean = false;
  editingAppointmentId: number | null = null;
  appointmentForm: Partial<MedicalAppointment> = {};

  // Añadir estas propiedades a la clase
  patientSearchTerm: string = '';
  patientStatusFilter: string = 'all';
  filteredPatientRecords: PatientRecord[] = [];
  selectedPatient: PatientRecord | null = null;
  isEditingPatient: boolean = false;
  editPatientForm: any = null;

  // Getter para filtrar citas según criterios
  get filteredAppointments(): MedicalAppointment[] {
    return this.medicalAppointments
      .filter(appointment => {
        // Filtro de búsqueda
        if (this.appointmentSearch) {
          const search = this.appointmentSearch.toLowerCase();
          return appointment.patientName.toLowerCase().includes(search) ||
                 (appointment.doctorName ?? '').toLowerCase().includes(search) ||
                 appointment.specialty.toLowerCase().includes(search);
        }
        return true;
      })
      .filter(appointment => {
        // Filtro de estado
        if (this.appointmentStatusFilter !== 'all') {
          return appointment.status === this.appointmentStatusFilter;
        }
        return true;
      })
      .filter(appointment => {
        // Filtro de fecha
        if (this.appointmentDateFilter === 'all') return true;
        
        const appointmentDate = new Date(appointment.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        switch (this.appointmentDateFilter) {
          case 'today':
            return appointmentDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return appointmentDate.toDateString() === tomorrow.toDateString();
          case 'week':
            return appointmentDate >= today && appointmentDate < nextWeek;
          case 'month':
            return appointmentDate >= today && appointmentDate < nextMonth;
          default:
            return true;
        }
      });
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private doctorsService: DoctorsService, // Inyectar el servicio
    private notificationService: NotificationService,
    private appointmentsService: AppointmentsService // Inyectar el servicio de citas
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });

    this.medicalStaff = [];

    this.loadDoctorsFromService();

    this.alertsSubscription = this.notificationService.getAlerts().subscribe(alerts => {
      this.alerts = alerts;
      this.alertCount = alerts.filter(alert => !alert.read).length;
    });

    this.appointmentSubscription = this.appointmentsService.getAllAppointments()
      .subscribe(appointments => {
        // Mapea snake_case a camelCase - SOLO campos que existen en el backend
        this.medicalAppointments = appointments.map(apt => ({
          id: apt.id,
          patientId: apt.patient_id ?? '',
          patientName: apt.patient_name ?? '',
          doctorId: apt.doctor_id ?? 0,
          doctorName: apt.doctor_name ?? '',
          specialty: apt.specialty ?? '',
          date: apt.date ?? '',
          time: apt.time ?? '',
          priority: apt.priority ?? 'medium',
          reason: apt.reason ?? '',
          status: apt.status ?? 'scheduled',
          notes: apt.notes ?? '',
          createdAt: apt.created_at ?? ''
          // Elimina patientAge, endTime, room porque NO existen en tu backend
        }));
      });

    this.loadRealPatientCount();
    this.loadPatients();
  }

  ngOnDestroy(): void {
    if (this.alertsSubscription) {
      this.alertsSubscription.unsubscribe();
    }
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe();
    }
  }

  // Método para cargar médicos del servicio
  loadDoctorsFromService() {
    this.doctorsService.getAllDoctors().subscribe({
      next: (doctors) => {
        if (doctors && Array.isArray(doctors) && doctors.length > 0) {
          this.medicalStaff = doctors.map(doctor => this.mapToMedicalStaff(doctor));
        } else {
          this.medicalStaff = [];
        }
      },
      error: () => {
        this.medicalStaff = [];
      }
    });
  }

  // Método para mapear Doctor a MedicalStaff
  mapToMedicalStaff(doctor: Doctor): MedicalStaff {
    return {
      id: doctor.id,
      name: doctor.name || '',
      specialty: doctor.specialty || '',
      license: 'Sin licencia', // Valor por defecto
      isOnCall: false,         // Valor por defecto
      currentPatients: 0,
      email: doctor.email || '',
      phone: doctor.phone || '',
      yearsExperience: 0,      // Valor por defecto
      department: doctor.specialty || ''
    };
  }

  // Método para mapear MedicalStaff a Doctor
  mapToDoctor(staff: MedicalStaff): Doctor {
    return {
      id: staff.id,
      name: staff.name,
      specialty: staff.specialty,
      email: staff.email,
      phone: staff.phone
    };
  }

  // Métodos para gestionar médicos
  // Método para inicializar un nuevo doctor
  addDoctor() {
    this.editingDoctor = {
      id: 0, // ID temporal que se cambiará al guardar
      name: '',
      specialty: '',
      license: '',
      isOnCall: false,
      currentPatients: 0,
      email: '',
      phone: '',
      yearsExperience: 0,
      department: ''
    };
    this.showDoctorModal = true;
  }

  // Método para editar un doctor existente
  editDoctor(doctor: MedicalStaff) {
    // Hacemos una copia para no modificar el original hasta guardar
    this.editingDoctor = { ...doctor };
    this.showDoctorModal = true;
  }

  // Método para guardar cambios (nuevo doctor o actualización)
  saveDoctor() {
    if (!this.editingDoctor) return;

    const doctorToSave = this.mapToDoctor(this.editingDoctor);

    if (doctorToSave.id === 0) {
      // Es nuevo doctor, añadirlo
      this.doctorsService.createDoctor(doctorToSave).subscribe({
        next: () => {
          this.showNotification('success', 'Médico agregado con éxito');
          this.loadDoctorsFromService();
        },
        error: () => {
          this.showNotification('error', 'Error al agregar médico');
        }
      });
    } else {
      // Doctor existente, actualizarlo
      this.doctorsService.updateDoctor(doctorToSave.id, doctorToSave).subscribe({
        next: () => {
          this.showNotification('success', 'Información del médico actualizada');
          this.loadDoctorsFromService();
        },
        error: () => {
          this.showNotification('error', 'Error al actualizar médico');
        }
      });
    }

    // Cerrar modal y resetear
    this.showDoctorModal = false;
    this.editingDoctor = null;
  }

  removeDoctor(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este médico?')) {
      this.doctorsService.removeDoctor(id);
      this.loadDoctorsFromService();
    }
  }

  // Método para cancelar la edición
  cancelEditDoctor() {
    // Cerrar modal sin guardar cambios
    this.showDoctorModal = false;
    this.editingDoctor = null;
  }

  // Método para cerrar el modal si se hace clic en el fondo
  closeModalOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.cancelEditDoctor();
    }
  }

  // Método para mostrar notificaciones (necesitarás implementar esto)
  showNotification(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    // Implementación simple: muestra alert por ahora
    // En una implementación real, usarías un componente de notificación
    if (type === 'success') {
      console.log('✅ ' + message);
      // Podrías implementar un toast o una notificación real aquí
    } else if (type === 'error') {
      console.error('❌ ' + message);
    }
  }

  // Navegación
  setActiveSection(section: 'dashboard' | 'appointments' | 'patients' | 'staff' | 'reports' | 'settings') {
    this.activeSection = section;
  }

  isActiveSection(section: string): boolean {
    return this.activeSection === section;
  }

  // Logout methods
  confirmLogout() {
    this.showLogoutPopup = true;
  }

  cancelLogout() {
    this.showLogoutPopup = false;
  }

  executeLogout() {
    // Call the AuthService logout method
    this.authService.logout();
    // No need to navigate here as the AuthService already handles it
  }

  closePopupOnBackdrop(event: Event) {
    // Close the popup if clicking on the backdrop (not on the popup content)
    if ((event.target as HTMLElement).classList.contains('logout-popup-overlay')) {
      this.showLogoutPopup = false;
    }
  }

  // Métodos médicos específicos
  updatePatientStatus(patientId: number, newStatus: 'active' | 'inactive' | 'critical') {
    const patient = this.patientRecords.find(p => p.id === patientId);
    if (patient) {
      patient.status = newStatus;
    }
  }

  viewPatientHistory(patientId: number) {
    console.log('Ver historial del paciente:', patientId);
  }

  toggleDoctorOnCall(doctorId: number) {
    const doctor = this.medicalStaff.find(d => d.id === doctorId);
    if (doctor) {
      doctor.isOnCall = !doctor.isOnCall;
    }
  }

  // Actualizar estado de una cita (reemplaza la versión anterior)
  updateAppointmentStatus(appointmentId: number, newStatus: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'confirmed') {
    this.appointmentsService.updateAppointment(appointmentId, { status: newStatus });
  }

  // Eliminar cita (reemplaza la versión anterior)
  deleteAppointment(appointmentId: number) {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      this.appointmentsService.updateAppointment(appointmentId, { status: 'cancelled' });
      this.showNotification('success', 'Cita eliminada correctamente');
    }
  }
  
  // Nuevo método para programar una cita
  scheduleAppointment() {
    // Abrir modal para crear nueva cita
    // Esta funcionalidad podría implementarse con un modal similar al de doctores
  }
  
  // Métodos de utilidad
  getPatientInitials(name: string): string {
    if (!name) return '--';
    
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }

  // Corrige el acceso a campos opcionales y tipos
  getDoctorName(appointment: MedicalAppointment): string {
    return appointment.doctorName || 'Sin nombre';
  }

  getSafeString(value: string | undefined): string {
    return value || '';
  }

  numberToString(value: number | string): string {
    return String(value ?? '');
  }

  // Corrige el uso de status y priority en clases y textos
  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-scheduled';
    return `status-${status}`;
  }

  getPriorityClass(priority: string | undefined): string {
    if (!priority) return 'priority-medium';
    return `priority-${priority}`;
  }

  getPriorityText(priority: string | undefined): string {
    if (!priority) return 'Media';
    const priorityMap: { [key: string]: string } = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return priorityMap[priority] || 'Media';
  }

  // Agrega estos métodos para evitar errores si no existen:
  loadRealPatientCount() {
    // Implementa la lógica real aquí si tienes endpoint, por ahora solo dummy:
    this.medicalStats.totalPatients = this.patientRecords.length;
  }

  loadPatients() {
    // Si tienes endpoint, carga pacientes aquí. Por ahora, ya están en patientRecords.
    this.filteredPatientRecords = this.patientRecords;
  }

  // Refresca datos médicos (dummy)
  refreshMedicalData() {
    // Aquí podrías recargar datos desde el backend si lo necesitas
  }

  // Devuelve el texto legible del estado de la cita
  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'confirmed': return 'Confirmada';
      case 'in-progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'emergency': return 'Emergencia';
      default: return status || '';
    }
  }

  // Alterna el perfil expandido del paciente
  togglePatientProfile(patientId: string | number) {
    this.expandedPatientId = this.expandedPatientId === patientId ? null : patientId;
  }

  // Formatea una fecha a formato local legible
  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Abre el modal para nueva cita (dummy)
  openNewAppointmentModal() {
    this.showAppointmentForm = true;
    this.editingAppointmentId = null;
    this.appointmentForm = {};
  }

  // Muestra detalles de una cita
  viewAppointmentDetails(appointment: MedicalAppointment) {
    this.selectedAppointment = appointment;
  }

  // Cierra detalles de cita
  closeAppointmentDetails() {
    this.selectedAppointment = null;
  }

  // Edita una cita (dummy)
  editAppointment(appointment: MedicalAppointment) {
    this.editingAppointmentId = appointment.id;
    this.appointmentForm = { ...appointment };
    this.showAppointmentForm = true;
  }

  // Guarda notas de una cita (dummy)
  saveAppointmentNotes() {
    // Aquí deberías guardar las notas en el backend
    this.closeAppointmentDetails();
  }

  // Cancela el formulario de cita
  cancelAppointmentForm() {
    this.showAppointmentForm = false;
    this.editingAppointmentId = null;
    this.appointmentForm = {};
  }

  // Guarda el formulario de cita (dummy)
  saveAppointmentForm() {
    // Aquí deberías guardar la cita en el backend
    this.showAppointmentForm = false;
    this.editingAppointmentId = null;
    this.appointmentForm = {};
  }
}
