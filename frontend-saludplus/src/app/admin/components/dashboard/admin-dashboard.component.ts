import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { DoctorsService, Doctor } from '../../../services/doctors.service';
import { NotificationService, Alert } from '../../services/notification.service';
import { AppointmentsService, MedicalAppointment } from '../../../services/appointments.service';
import { Subscription } from 'rxjs';

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
  selectedPatient: PatientRecord | null = null;
  isEditingPatient = false;
  editPatientForm: any = {};

  // Getter para filtrar citas según criterios
  get filteredAppointments(): MedicalAppointment[] {
    return this.medicalAppointments
      .filter(appointment => {
        // Filtro de búsqueda
        if (this.appointmentSearch) {
          const search = this.appointmentSearch.toLowerCase();
          return appointment.patientName.toLowerCase().includes(search) ||
                 appointment.doctorName.toLowerCase().includes(search) ||
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

    // Suscribirse a las citas médicas
    this.appointmentSubscription = this.appointmentsService.getAllAppointments()
      .subscribe(appointments => {
        this.medicalAppointments = appointments;
      });

    this.loadRealPatientCount();
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
  updateAppointmentStatus(appointmentId: number, newStatus: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'emergency') {
    this.appointmentsService.updateAppointmentStatus(appointmentId, newStatus);
  }

  // Eliminar cita (reemplaza la versión anterior)
  deleteAppointment(appointmentId: number) {
    if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
      this.appointmentsService.updateAppointment({ id: appointmentId, status: 'cancelled' });
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
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

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
    return priorityMap[priority] || priority;
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }

  refreshMedicalData() {
    console.log('Refrescando datos médicos...');
    // Asegurarse de que estas propiedades existen en medicalStats
    this.medicalStats.todayAppointments = (this.medicalStats.todayAppointments || 0) + Math.floor(Math.random() * 5);
    this.medicalStats.emergencyAlerts = Math.floor(Math.random() * 5);
    this.medicalStats.monthlyRevenue = (this.medicalStats.monthlyRevenue || 0) + Math.floor(Math.random() * 10000);
  }
  
  // Ver detalles de una cita
  viewAppointmentDetails(appointmentId: number): void {
    const appointment = this.medicalAppointments.find(a => a.id === appointmentId);
    if (appointment) {
      this.selectedAppointment = { ...appointment };
    }
  }

  // Cerrar el modal de detalles
  closeAppointmentDetails(): void {
    this.selectedAppointment = null;
  }

  // Guardar notas de la cita
  saveAppointmentNotes(): void {
    if (this.selectedAppointment) {
      this.appointmentsService.updateAppointment({
        id: this.selectedAppointment.id,
        notes: this.selectedAppointment.notes
      });
      this.showNotification('success', 'Notas actualizadas correctamente');
    }
  }

  // Abrir formulario para nueva cita
  openNewAppointmentModal(): void {
    this.editingAppointmentId = null;
    this.appointmentForm = {
      patientName: '',
      patientAge: 0,
      doctorId: 0,
      specialty: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      endTime: '09:30',
      priority: 'medium',
      room: '',
      reason: '',
      status: 'scheduled'
    };
    this.showAppointmentForm = true;
  }

  // Editar una cita existente
  editAppointment(appointmentId: number): void {
    const appointment = this.medicalAppointments.find(a => a.id === appointmentId);
    if (appointment) {
      this.editingAppointmentId = appointmentId;
      this.appointmentForm = { ...appointment };
      this.showAppointmentForm = true;
    }
  }

  // Cancelar formulario de cita
  cancelAppointmentForm(): void {
    this.showAppointmentForm = false;
    this.appointmentForm = {};
    this.editingAppointmentId = null;
  }

  // Guardar el formulario de cita (nueva o editada)
  saveAppointmentForm(): void {
    if (this.editingAppointmentId) {
      // Actualizar cita existente
      this.appointmentsService.updateAppointment({
        id: this.editingAppointmentId,
        ...this.appointmentForm
      });
      this.showNotification('success', 'Cita actualizada correctamente');
    } else {
      // Crear nueva cita
      const newAppointment = {
        ...this.appointmentForm,
        id: Date.now(), // Genera un ID único
        createdAt: new Date()
      };
      this.appointmentsService.updateAppointment(newAppointment);
      this.showNotification('success', 'Cita creada correctamente');
    }
    this.cancelAppointmentForm();
  }

  // Actualizar el método togglePatientProfile
  togglePatientProfile(patientId: string | number): void {
    if (this.expandedPatientId === patientId) {
      this.closePatientProfile();
    } else {
      this.expandedPatientId = patientId;
      this.selectedPatient = this.patientRecords.find(p => p.id === patientId) || null;
      this.isEditingPatient = false;
      this.resetEditForm();
    }
  }
  
  // Método para actualizar datos del dashboard
  refreshDashboardData() {
    this.loadRealPatientCount();
    // Cualquier otra actualización de datos necesaria
    
    // Mostrar mensaje de éxito
    console.log('Dashboard actualizado correctamente');
    
    // Si tienes un servicio de notificación podrías usarlo así:
    // this.notificationService.success('Dashboard Actualizado', 'Los datos han sido actualizados correctamente');
  }

  // Agregar este método que falta en la clase AdminDashboardComponent
  loadRealPatientCount() {
    // Suscribirse al servicio de usuarios para obtener todos los usuarios disponibles
    this.authService.currentUser.subscribe(admin => {
      if (admin && admin.role === 'admin') {
        // Obtener todos los usuarios del localStorage (ya que no hay método público)
        const allUsers = this.getAllLocalStorageUsers();
        
        // Filtrar solo pacientes
        const patients = allUsers.filter(user => 
          user.role === 'patient' || (user.id && user.id.toString().includes('patient-'))
        );
        
        // Actualizar contador
        this.medicalStats.totalPatients = patients.length;
        
        // Reemplazar los datos estáticos con los reales
        this.patientRecords = patients.map(user => this.mapUserToPatientRecord(user));
        
        console.log(`Total de pacientes cargados: ${this.patientRecords.length}`);
      }
    });
  }

  // Nuevo método para obtener usuarios del localStorage (ya que getAllUsers es privado)
  private getAllLocalStorageUsers(): User[] {
    try {
      const usersJson = localStorage.getItem('users');
      if (usersJson) {
        return JSON.parse(usersJson);
      }
    } catch (error) {
      console.error('Error al leer usuarios del localStorage:', error);
    }
    return [];
  }

  // Nuevo método para mapear un usuario a un registro de paciente
  private mapUserToPatientRecord(user: User): PatientRecord {
    // Extraer ID numérico si tiene formato "patient-XXX"
    let numericId = 0;
    if (user.id && typeof user.id === 'string' && user.id.includes('-')) {
      const parts = user.id.split('-');
      numericId = parseInt(parts[1], 10);
    } else if (user.id) {
      numericId = parseInt(user.id.toString(), 10);
    }
    
    // Buscar si tenemos citas para este paciente para obtener información adicional
    const patientAppointments = this.medicalAppointments.filter(apt => 
      apt.patientId === numericId || apt.patientName === user.name
    );
    
    // Última visita (fecha de la última cita completada o la más reciente)
    let lastVisit = '';
    if (patientAppointments.length > 0) {
      const sortedAppointments = [...patientAppointments].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      lastVisit = sortedAppointments[0].date;
    }
    
    // Mapear usuario a formato PatientRecord
    return {
      id: numericId,
      name: user.name,
      age: this.calculateAgeFromBirthdate(user.birthdate) || 35, // Valor predeterminado si no hay edad
      gender: this.determineGender(user.name) || 'M', // Intentar determinar por nombre o usar predeterminado
      email: user.email || '',
      phone: user.phone || '',
      bloodType: user.bloodType || this.getRandomBloodType(),
      allergies: user.allergies || [],
      chronic: user.chronic || [],
      lastVisit: lastVisit || new Date().toISOString().split('T')[0],
      totalVisits: patientAppointments.length,
      status: this.determineStatus(patientAppointments),
      emergencyContact: user.emergencyContact || ''
    };
  }

  // Funciones auxiliares
  private calculateAgeFromBirthdate(birthdate?: string): number {
    if (!birthdate) return 0;
    
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private determineGender(name?: string): 'M' | 'F' | undefined {
    if (!name) return undefined;
    
    // Lista simple de terminaciones comunes para nombres femeninos en español
    const femaleEndings = ['a', 'ia', 'ina', 'ita'];
    const lastName = name.split(' ')[0].toLowerCase();
    
    // Si termina en una de las terminaciones comunes femeninas
    for (const ending of femaleEndings) {
      if (lastName.endsWith(ending)) return 'F';
    }
    
    return 'M'; // Predeterminado a masculino si no hay coincidencia
  }

  private getRandomBloodType(): string {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
  }

  private determineStatus(appointments: MedicalAppointment[]): 'active' | 'inactive' | 'critical' {
    if (appointments.length === 0) return 'inactive';
    
    // Verificar si hay citas recientes (en los últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAppointments = appointments.filter(apt => 
      new Date(apt.date) >= thirtyDaysAgo
    );
    
    // Si tiene citas recientes con prioridad alta o emergencia, marcar como crítico
    const criticalAppointments = appointments.filter(apt => 
      apt.priority === 'high' || apt.priority === 'urgent' || apt.status === 'emergency'
    );
    
    if (criticalAppointments.length > 0) return 'critical';
    if (recentAppointments.length > 0) return 'active';
    
    return 'inactive';
  }

  // Nuevo método para cerrar el perfil
  closePatientProfile(): void {
    this.expandedPatientId = null;
    this.selectedPatient = null;
    this.isEditingPatient = false;
  }

  // Método para iniciar edición
  editPatient(): void {
    if (this.isEditingPatient) {
      this.cancelEditPatient();
    } else {
      this.isEditingPatient = true;
      this.editPatientForm = {
        ...this.selectedPatient,
        allergies: [...(this.selectedPatient?.allergies || [])],
        chronic: [...(this.selectedPatient?.chronic || [])]
      };
    }
  }

  // Resetear formulario de edición
  resetEditForm(): void {
    this.editPatientForm = {};
  }

  // Cancelar edición
  cancelEditPatient(): void {
    this.isEditingPatient = false;
    this.resetEditForm();
  }

  // Guardar cambios del paciente
  savePatientChanges(): void {
    if (this.selectedPatient && this.editPatientForm) {
      const index = this.patientRecords.findIndex(p => p.id === this.selectedPatient!.id);
      if (index !== -1) {
        this.patientRecords[index] = { ...this.editPatientForm };
        this.selectedPatient = this.patientRecords[index];
        this.isEditingPatient = false;
        
        // Aquí podrías llamar a un servicio para guardar en el backend
        console.log('Paciente actualizado:', this.selectedPatient);
      }
    }
  }

  // Métodos para manejar alergias
  addAllergy(allergy: string): void {
    if (allergy.trim() && !this.editPatientForm.allergies.includes(allergy.trim())) {
      this.editPatientForm.allergies.push(allergy.trim());
    }
  }

  removeAllergy(index: number): void {
    this.editPatientForm.allergies.splice(index, 1);
  }

  // Métodos para manejar enfermedades crónicas
  addChronic(chronic: string): void {
    if (chronic.trim() && !this.editPatientForm.chronic.includes(chronic.trim())) {
      this.editPatientForm.chronic.push(chronic.trim());
    }
  }

  removeChronic(index: number): void {
    this.editPatientForm.chronic.splice(index, 1);
  }
}
