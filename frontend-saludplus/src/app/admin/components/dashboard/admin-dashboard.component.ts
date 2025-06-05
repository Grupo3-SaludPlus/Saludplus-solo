import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { DoctorsService, Doctor } from '../../../services/doctors.service';
import { NotificationService, Alert } from '../../services/notification.service';
import { Subscription } from 'rxjs';

interface MedicalStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  monthlyRevenue: number;
  emergencyAlerts: number;
  activeSpecialties: number;
}

interface MedicalAppointment {
  id: number;
  patientName: string;
  patientAge: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  room?: string;
}

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

interface PatientRecord {
  id: number;
  name: string;
  age: number;
  gender: 'M' | 'F';
  email: string;
  phone: string;
  bloodType: string;
  allergies: string[];
  chronic: string[];
  lastVisit: string;
  totalVisits: number;
  status: 'active' | 'inactive' | 'critical';
  emergencyContact: string;
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
  medicalStats: MedicalStats = {
    totalPatients: 2847,
    totalDoctors: 45,
    todayAppointments: 127,
    monthlyRevenue: 285000,
    emergencyAlerts: 3,
    activeSpecialties: 12
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
  medicalAppointments: MedicalAppointment[] = [
    {
      id: 1,
      patientName: 'María Elena García',
      patientAge: 45,
      doctorName: 'Dr. Juan Carlos Pérez',
      specialty: 'Cardiología',
      date: '2024-01-22',
      time: '09:00',
      status: 'scheduled',
      priority: 'high',
      reason: 'Control post-operatorio válvula mitral',
      room: 'Consulta 201'
    },
    {
      id: 2,
      patientName: 'Roberto Silva Martínez',
      patientAge: 67,
      doctorName: 'Dra. Carmen Silva',
      specialty: 'Medicina Interna',
      date: '2024-01-22',
      time: '10:30',
      status: 'in-progress',
      priority: 'urgent',
      reason: 'Descompensación diabética',
      room: 'Urgencias 105'
    },
    {
      id: 3,
      patientName: 'Carmen López Vega',
      patientAge: 34,
      doctorName: 'Dra. Ana María Rodríguez',
      specialty: 'Ginecología',
      date: '2024-01-22',
      time: '14:00',
      status: 'scheduled',
      priority: 'medium',
      reason: 'Control prenatal - 32 semanas',
      room: 'Consulta 305'
    },
    {
      id: 4,
      patientName: 'José Luis Morales',
      patientAge: 28,
      doctorName: 'Dr. Miguel Torres',
      specialty: 'Traumatología',
      date: '2024-01-22',
      time: '11:15',
      status: 'emergency',
      priority: 'urgent',
      reason: 'Fractura de tibia - Accidente laboral',
      room: 'Trauma 102'
    }
  ];

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
  expandedPatientId: number | null = null;

  // Propiedad para controlar la vista de personal médico
  staffViewMode: 'table' | 'cards' = 'table';
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private doctorsService: DoctorsService, // Inyectar el servicio
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    
    // Inicializar explícitamente como array vacío en caso de que algo falle
    this.medicalStaff = [];
    
    // Cargar médicos desde el servicio
    this.loadDoctorsFromService();

    // Suscribirse a las alertas
    this.alertsSubscription = this.notificationService.getAlerts().subscribe(alerts => {
      this.alerts = alerts;
      this.alertCount = alerts.filter(alert => !alert.read).length;
    });
  }

  ngOnDestroy(): void {
    if (this.alertsSubscription) {
      this.alertsSubscription.unsubscribe();
    }
  }

  // Método para cargar médicos del servicio
  loadDoctorsFromService() {
    try {
      const serviceDoctors = this.doctorsService.getAllDoctors();
      console.log("Médicos cargados del servicio:", serviceDoctors);
      
      // Solo asignar si hay médicos y es un array válido
      if (serviceDoctors && Array.isArray(serviceDoctors) && serviceDoctors.length > 0) {
        this.medicalStaff = serviceDoctors.map(doctor => this.mapToMedicalStaff(doctor));
      } else {
        console.log("No se encontraron médicos en el servicio o formato inválido");
        // Mantener como array vacío en lugar de asignar null o undefined
        this.medicalStaff = [];
      }
    } catch (error) {
      console.error("Error al cargar médicos:", error);
      // Mantener como array vacío en caso de error
      this.medicalStaff = [];
    }
  }

  // Método para mapear Doctor a MedicalStaff
  mapToMedicalStaff(doctor: Doctor): MedicalStaff {
    return {
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      license: doctor.license || 'Sin licencia',
      isOnCall: doctor.isOnCall || false,
      currentPatients: 0, // Valor por defecto
      email: doctor.email,
      phone: doctor.phoneNumber || '',
      yearsExperience: parseInt(doctor.experience?.split(' ')[0] || '0') || 0,
      department: doctor.department || doctor.specialty
    };
  }

  // Método para mapear MedicalStaff a Doctor
  mapToDoctor(staff: MedicalStaff): Doctor {
    const existingDoctor = this.doctorsService.getAllDoctors().find(d => d.id === staff.id);
    
    return {
      id: staff.id,
      name: staff.name,
      specialty: staff.specialty,
      image: existingDoctor?.image || 'assets/img/doctor-placeholder.jpg',
      rating: existingDoctor?.rating || 4.0, // Valor predeterminado para evitar undefined
      education: existingDoctor?.education || 'Universidad de Chile',
      experience: `${staff.yearsExperience} años de experiencia`,
      availability: existingDoctor?.availability || 'Lun - Vie: 9:00 - 17:00',
      biography: existingDoctor?.biography || `Especialista en ${staff.specialty} con amplia experiencia.`,
      phoneNumber: staff.phone,
      email: staff.email,
      consultationFee: existingDoctor?.consultationFee || 100000,
      isOnCall: staff.isOnCall,
      department: staff.department,
      license: staff.license
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
      this.doctorsService.addDoctor(doctorToSave);
      // Mostrar mensaje de éxito
      this.showNotification('success', 'Médico agregado con éxito');
    } else {
      // Doctor existente, actualizarlo
      this.doctorsService.updateDoctor(doctorToSave);
      // Mostrar mensaje de éxito
      this.showNotification('success', 'Información del médico actualizada');
    }
    
    // Recargar la lista actualizada
    this.loadDoctorsFromService();
    
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
    this.showLogoutPopup = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }

  closePopupOnBackdrop(event: Event) {
    if (event.target === event.currentTarget) {
      this.cancelLogout();
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

  updateAppointmentStatus(appointmentId: number, newStatus: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'emergency') {
    const appointment = this.medicalAppointments.find(a => a.id === appointmentId);
    if (appointment) {
      appointment.status = newStatus;
    }
  }

  deleteAppointment(appointmentId: number) {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      this.medicalAppointments = this.medicalAppointments.filter(a => a.id !== appointmentId);
      console.log('Cita cancelada:', appointmentId);
    }
  }

  downloadReport(reportId: number) {
    console.log('Descargando reporte:', reportId);
    // Aquí iría la lógica real de descarga
  }

  generateMedicalReport(type: 'patient-stats' | 'financial' | 'staff-performance' | 'medication-inventory' | 'equipment-status') {
    console.log('Generando reporte médico:', type);
    // Aquí iría la lógica real de generación
  }
  
  // Métodos de utilidad
  getPatientInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'scheduled': 'Agendada',
      'in-progress': 'En Curso',
      'completed': 'Completada',
      'cancelled': 'Cancelada',
      'emergency': 'Emergencia',
      'active': 'Activo',
      'inactive': 'Inactivo',
      'critical': 'Crítico'
    };
    return statusMap[status] || status;
  }

  getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return priorityMap[priority] || priority;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  refreshMedicalData() {
    console.log('Refrescando datos médicos...');
    this.medicalStats.todayAppointments += Math.floor(Math.random() * 5);
    this.medicalStats.emergencyAlerts = Math.floor(Math.random() * 6);
  }

  toggleAlertsPopup(): void {
    this.showAlertsPopup = !this.showAlertsPopup;
  }
  
  closeAlertsPopup(): void {
    this.showAlertsPopup = false;
  }
  
  handleAlertAction(event: any): void {
    if (event.action === 'markAllAsRead') {
      this.notificationService.markAllAsRead();
    } else if (event.action === 'refresh') {
      // Implementar lógica de actualización de alertas
      console.log('Refreshing alerts');
    } else {
      this.notificationService.handleAlertAction(event.alertId, event.action);
    }
  }

  // Método para expandir/colapsar el perfil de un paciente
  togglePatientProfile(patientId: number): void {
    this.expandedPatientId = this.expandedPatientId === patientId ? null : patientId;
  }
}