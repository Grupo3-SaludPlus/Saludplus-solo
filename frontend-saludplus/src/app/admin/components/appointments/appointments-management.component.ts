import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialtyId: number;
  specialtyName: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Doctor {
  id: number;
  name: string;
  specialtyId: number;
  specialtyName: string;
  available: boolean;
}

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Specialty {
  id: number;
  name: string;
}

@Component({
  selector: 'app-appointments-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './appointments-management.component.html',
  styleUrls: ['./appointments-management.component.css']
})
export class AppointmentsManagementComponent implements OnInit {
  // Datos para la tabla principal
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  
  // Datos para los formularios
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  specialties: Specialty[] = [];
  
  // Estado de la vista
  isLoading: boolean = false;
  currentView: 'list' | 'create' | 'edit' | 'detail' = 'list';
  searchTerm: string = '';
  statusFilter: string = 'all';
  dateFilter: string = '';
  selectedAppointment: Appointment | null = null;
  
  // Formulario de cita
  appointmentForm: FormGroup;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  
  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    // Inicializar formulario
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      specialtyId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      status: ['scheduled', Validators.required],
      notes: ['']
    });
  }
  
  ngOnInit() {
    this.loadAppointments();
    this.loadDoctors();
    this.loadPatients();
    this.loadSpecialties();
  }
  
  // Métodos para la carga de datos
  loadAppointments() {
    this.isLoading = true;
    
    // Aquí normalmente harías una llamada al servicio
    // Por ahora usamos datos de ejemplo
    setTimeout(() => {
      this.appointments = this.getMockAppointments();
      this.filterAppointments();
      this.isLoading = false;
    }, 800); // Simulamos un retraso en la carga
  }
  
  loadDoctors() {
    // Datos de ejemplo para médicos
    this.doctors = [
      { id: 1, name: 'Dra. Carla Mendoza', specialtyId: 1, specialtyName: 'Cardiología', available: true },
      { id: 2, name: 'Dr. Roberto Fuentes', specialtyId: 2, specialtyName: 'Neurología', available: true },
      { id: 3, name: 'Dra. Valentina Torres', specialtyId: 3, specialtyName: 'Pediatría', available: true },
      { id: 4, name: 'Dr. Andrés Soto', specialtyId: 4, specialtyName: 'Traumatología', available: true },
      { id: 5, name: 'Dra. María López', specialtyId: 5, specialtyName: 'Dermatología', available: true }
    ];
  }
  
  loadPatients() {
    // Datos de ejemplo para pacientes
    this.patients = [
      { id: 101, name: 'Ana García', email: 'ana.garcia@ejemplo.com', phone: '555-123-4567' },
      { id: 102, name: 'Juan López', email: 'juan.lopez@ejemplo.com', phone: '555-234-5678' },
      { id: 103, name: 'María González', email: 'maria.glez@ejemplo.com', phone: '555-345-6789' },
      { id: 104, name: 'Pedro Sánchez', email: 'pedro.sanchez@ejemplo.com', phone: '555-456-7890' },
      { id: 105, name: 'Lucía Martínez', email: 'lucia.martinez@ejemplo.com', phone: '555-567-8901' }
    ];
  }
  
  loadSpecialties() {
    // Datos de ejemplo para especialidades
    this.specialties = [
      { id: 1, name: 'Cardiología' },
      { id: 2, name: 'Neurología' },
      { id: 3, name: 'Pediatría' },
      { id: 4, name: 'Traumatología' },
      { id: 5, name: 'Dermatología' },
      { id: 6, name: 'Oftalmología' },
      { id: 7, name: 'Ginecología' }
    ];
  }
  
  // Filtrado de citas
  filterAppointments() {
    let filtered = [...this.appointments];
    
    // Filtrado por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.patientName.toLowerCase().includes(term) ||
        appointment.doctorName.toLowerCase().includes(term) ||
        appointment.id.toString().includes(term)
      );
    }
    
    // Filtrado por estado
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === this.statusFilter);
    }
    
    // Filtrado por fecha
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter).toDateString();
      filtered = filtered.filter(appointment => 
        appointment.date.toDateString() === filterDate
      );
    }
    
    // Actualizar total y lista filtrada
    this.totalItems = filtered.length;
    this.filteredAppointments = this.paginateAppointments(filtered);
  }
  
  paginateAppointments(appointments: Appointment[]): Appointment[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return appointments.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  // Navegación entre páginas
  changePage(page: number) {
    this.currentPage = page;
    this.filterAppointments();
  }
  
  // Manejo de búsqueda y filtros
  onSearch() {
    this.currentPage = 1;
    this.filterAppointments();
  }
  
  onStatusFilterChange(status: string) {
    this.statusFilter = status;
    this.currentPage = 1;
    this.filterAppointments();
  }
  
  onDateFilterChange() {
    this.currentPage = 1;
    this.filterAppointments();
  }
  
  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.dateFilter = '';
    this.currentPage = 1;
    this.filterAppointments();
  }
  
  // Gestión de citas
  viewAppointmentDetails(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.currentView = 'detail';
    
    this.notificationService.info(
      'Detalles de cita',
      `Visualizando la cita #${appointment.id}`
    );
  }
  
  createNewAppointment() {
    this.appointmentForm.reset({
      status: 'scheduled'
    });
    this.currentView = 'create';
  }
  
  editAppointment(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.appointmentForm.setValue({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      specialtyId: appointment.specialtyId,
      date: this.formatDateForInput(appointment.date),
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes
    });
    this.currentView = 'edit';
    
    this.notificationService.info(
      'Edición de cita',
      `Editando la cita #${appointment.id}`
    );
  }
  
  cancelAppointment(appointment: Appointment) {
    if (confirm(`¿Está seguro de que desea cancelar la cita #${appointment.id}?`)) {
      // Aquí realizarías la llamada al servicio
      // Simulamos actualización
      const index = this.appointments.findIndex(a => a.id === appointment.id);
      if (index !== -1) {
        this.appointments[index].status = 'cancelled';
        this.filterAppointments();
        
        this.notificationService.success(
          'Cita cancelada',
          `La cita #${appointment.id} ha sido cancelada correctamente`
        );
      }
    }
  }
  
  deleteAppointment(appointment: Appointment) {
    const notificationId = this.notificationService.warning(
      'Confirmación requerida',
      `¿Está seguro de que desea eliminar la cita #${appointment.id}? Esta acción no se puede deshacer.`,
      { autoClose: false }
    );
    
    if (confirm(`¿Confirma la eliminación de la cita #${appointment.id}?`)) {
      // Aquí realizarías la llamada al servicio
      // Simulamos eliminación
      this.appointments = this.appointments.filter(a => a.id !== appointment.id);
      this.filterAppointments();
      
      this.notificationService.remove(notificationId);
      this.notificationService.success(
        'Cita eliminada',
        `La cita #${appointment.id} ha sido eliminada correctamente`
      );
    } else {
      this.notificationService.remove(notificationId);
    }
  }
  
  // Manejo de formularios
  submitAppointmentForm() {
    if (this.appointmentForm.invalid) {
      this.notificationService.error(
        'Formulario inválido',
        'Por favor, complete todos los campos requeridos'
      );
      return;
    }
    
    const formValue = this.appointmentForm.value;
    
    if (this.currentView === 'create') {
      // Crear nueva cita
      const newAppointment: Appointment = {
        id: this.generateNewId(),
        patientId: formValue.patientId,
        patientName: this.getPatientName(formValue.patientId),
        doctorId: formValue.doctorId,
        doctorName: this.getDoctorName(formValue.doctorId),
        specialtyId: formValue.specialtyId,
        specialtyName: this.getSpecialtyName(formValue.specialtyId),
        date: new Date(formValue.date),
        time: formValue.time,
        status: formValue.status,
        notes: formValue.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Aquí realizarías la llamada al servicio
      // Simulamos adición
      this.appointments.unshift(newAppointment);
      this.filterAppointments();
      this.currentView = 'list';
      
      this.notificationService.success(
        'Cita creada',
        `La cita #${newAppointment.id} ha sido creada correctamente`
      );
    } 
    else if (this.currentView === 'edit' && this.selectedAppointment) {
      // Actualizar cita existente
      const updatedAppointment: Appointment = {
        ...this.selectedAppointment,
        patientId: formValue.patientId,
        patientName: this.getPatientName(formValue.patientId),
        doctorId: formValue.doctorId,
        doctorName: this.getDoctorName(formValue.doctorId),
        specialtyId: formValue.specialtyId,
        specialtyName: this.getSpecialtyName(formValue.specialtyId),
        date: new Date(formValue.date),
        time: formValue.time,
        status: formValue.status,
        notes: formValue.notes,
        updatedAt: new Date()
      };
      
      // Aquí realizarías la llamada al servicio
      // Simulamos actualización
      const index = this.appointments.findIndex(a => a.id === updatedAppointment.id);
      if (index !== -1) {
        this.appointments[index] = updatedAppointment;
        this.filterAppointments();
        this.currentView = 'list';
        
        this.notificationService.success(
          'Cita actualizada',
          `La cita #${updatedAppointment.id} ha sido actualizada correctamente`
        );
      }
    }
  }
  
  cancelForm() {
    this.currentView = 'list';
    this.appointmentForm.reset();
    this.selectedAppointment = null;
  }
  
  // Métodos auxiliares
  formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }
  
  getStatusText(status: string): string {
    switch(status) {
      case 'scheduled': return 'Programada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  }
  
  getPatientName(id: number): string {
    const patient = this.patients.find(p => p.id === id);
    return patient ? patient.name : 'Paciente desconocido';
  }
  
  getDoctorName(id: number): string {
    const doctor = this.doctors.find(d => d.id === id);
    return doctor ? doctor.name : 'Médico desconocido';
  }
  
  getSpecialtyName(id: number): string {
    const specialty = this.specialties.find(s => s.id === id);
    return specialty ? specialty.name : 'Especialidad desconocida';
  }
  
  generateNewId(): number {
    const maxId = this.appointments.reduce((max, appointment) => 
      appointment.id > max ? appointment.id : max, 0);
    return maxId + 1;
  }
  
  // Datos de ejemplo
  getMockAppointments(): Appointment[] {
    return [
      {
        id: 1001,
        patientId: 101,
        patientName: 'Ana García',
        doctorId: 1,
        doctorName: 'Dra. Carla Mendoza',
        specialtyId: 1,
        specialtyName: 'Cardiología',
        date: new Date('2025-06-05'),
        time: '10:30',
        status: 'scheduled',
        notes: 'Revisión cardíaca anual.',
        createdAt: new Date('2025-05-20'),
        updatedAt: new Date('2025-05-20')
      },
      {
        id: 1002,
        patientId: 102,
        patientName: 'Juan López',
        doctorId: 2,
        doctorName: 'Dr. Roberto Fuentes',
        specialtyId: 2,
        specialtyName: 'Neurología',
        date: new Date('2025-06-10'),
        time: '11:45',
        status: 'scheduled',
        notes: 'Episodios de migraña frecuentes.',
        createdAt: new Date('2025-05-22'),
        updatedAt: new Date('2025-05-22')
      },
      {
        id: 1003,
        patientId: 103,
        patientName: 'María González',
        doctorId: 3,
        doctorName: 'Dra. Valentina Torres',
        specialtyId: 3,
        specialtyName: 'Pediatría',
        date: new Date('2025-06-03'),
        time: '09:15',
        status: 'completed',
        notes: 'Control de desarrollo del niño.',
        createdAt: new Date('2025-05-15'),
        updatedAt: new Date('2025-06-03')
      },
      {
        id: 1004,
        patientId: 104,
        patientName: 'Pedro Sánchez',
        doctorId: 4,
        doctorName: 'Dr. Andrés Soto',
        specialtyId: 4,
        specialtyName: 'Traumatología',
        date: new Date('2025-06-01'),
        time: '16:00',
        status: 'cancelled',
        notes: 'Dolor en la rodilla izquierda.',
        createdAt: new Date('2025-05-10'),
        updatedAt: new Date('2025-05-30')
      },
      {
        id: 1005,
        patientId: 105,
        patientName: 'Lucía Martínez',
        doctorId: 5,
        doctorName: 'Dra. María López',
        specialtyId: 5,
        specialtyName: 'Dermatología',
        date: new Date('2025-06-08'),
        time: '14:30',
        status: 'scheduled',
        notes: 'Revisión de lesión cutánea.',
        createdAt: new Date('2025-05-25'),
        updatedAt: new Date('2025-05-25')
      },
      {
        id: 1006,
        patientId: 101,
        patientName: 'Ana García',
        doctorId: 5,
        doctorName: 'Dra. María López',
        specialtyId: 5,
        specialtyName: 'Dermatología',
        date: new Date('2025-06-15'),
        time: '09:00',
        status: 'scheduled',
        notes: 'Evaluación de lunares.',
        createdAt: new Date('2025-05-26'),
        updatedAt: new Date('2025-05-26')
      },
      {
        id: 1007,
        patientId: 103,
        patientName: 'María González',
        doctorId: 1,
        doctorName: 'Dra. Carla Mendoza',
        specialtyId: 1,
        specialtyName: 'Cardiología',
        date: new Date('2025-06-07'),
        time: '11:00',
        status: 'pending',
        notes: 'Examen de ecocardiograma.',
        createdAt: new Date('2025-05-23'),
        updatedAt: new Date('2025-05-23')
      },
      {
        id: 1008,
        patientId: 102,
        patientName: 'Juan López',
        doctorId: 3,
        doctorName: 'Dra. Valentina Torres',
        specialtyId: 3,
        specialtyName: 'Pediatría',
        date: new Date('2025-06-20'),
        time: '15:45',
        status: 'scheduled',
        notes: 'Seguimiento de tratamiento.',
        createdAt: new Date('2025-05-27'),
        updatedAt: new Date('2025-05-27')
      },
      {
        id: 1009,
        patientId: 104,
        patientName: 'Pedro Sánchez',
        doctorId: 2,
        doctorName: 'Dr. Roberto Fuentes',
        specialtyId: 2,
        specialtyName: 'Neurología',
        date: new Date('2025-06-12'),
        time: '10:15',
        status: 'scheduled',
        notes: 'Evaluación de dolor de cabeza crónico.',
        createdAt: new Date('2025-05-24'),
        updatedAt: new Date('2025-05-24')
      },
      {
        id: 1010,
        patientId: 105,
        patientName: 'Lucía Martínez',
        doctorId: 4,
        doctorName: 'Dr. Andrés Soto',
        specialtyId: 4,
        specialtyName: 'Traumatología',
        date: new Date('2025-06-18'),
        time: '16:30',
        status: 'scheduled',
        notes: 'Revisión postoperatoria.',
        createdAt: new Date('2025-05-28'),
        updatedAt: new Date('2025-05-28')
      },
      // Más citas de ejemplo para probar la paginación
      {
        id: 1011,
        patientId: 101,
        patientName: 'Ana García',
        doctorId: 2,
        doctorName: 'Dr. Roberto Fuentes',
        specialtyId: 2,
        specialtyName: 'Neurología',
        date: new Date('2025-06-22'),
        time: '09:30',
        status: 'scheduled',
        notes: 'Evaluación general.',
        createdAt: new Date('2025-05-29'),
        updatedAt: new Date('2025-05-29')
      },
      {
        id: 1012,
        patientId: 102,
        patientName: 'Juan López',
        doctorId: 5,
        doctorName: 'Dra. María López',
        specialtyId: 5,
        specialtyName: 'Dermatología',
        date: new Date('2025-06-25'),
        time: '14:00',
        status: 'scheduled',
        notes: 'Tratamiento para acné.',
        createdAt: new Date('2025-05-30'),
        updatedAt: new Date('2025-05-30')
      }
    ];
  }
}