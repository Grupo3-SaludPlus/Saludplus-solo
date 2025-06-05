import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../admin/services/notification.service';

interface Appointment {
  id: number;
  patient: {
    id: number;
    name: string;
  };
  doctorId: number;
  doctor: string;
  specialty: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending' | 'confirmed';
  notes?: string;
  createdAt: Date;
  medicalCenter?: string;
  confirmationDate?: Date;
}

@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './appointment-history.component.html',
  styleUrls: ['./appointment-history.component.css']
})
export class AppointmentHistoryComponent implements OnInit {
  currentUser: User | null = null;
  currentSection: string = 'dashboard';
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  
  // Filtros
  statusFilter: string = 'all';
  dateFilter: string = '';
  searchTerm: string = '';
  
  // Ordenamiento
  sortField: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Control de detalles
  selectedAppointment: Appointment | null = null;
  isViewingDetails: boolean = false;
  
  // Control de cancelación
  appointmentToCancel: Appointment | null = null;
  cancellationReason: string = '';
  showCancelDialog: boolean = false;
  
  // Control de confirmación
  showConfirmDialog: boolean = false;
  appointmentToConfirm: Appointment | null = null;
  
  // Control de acceso
  isDoctor: boolean = false;
  isAdmin: boolean = false;
  
  // Estado de carga
  isLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // Determinar el rol del usuario
        this.isAdmin = user.role === 'admin';
        this.isDoctor = user.role === 'doctor';
        
        this.loadAppointments();
      } else {
        this.appointments = [];
        this.filteredAppointments = [];
      }
    });
  }

  loadAppointments(): void {
    this.isLoading = true;
    
    // En un entorno real, aquí se llamaría a un servicio para obtener las citas
    // Por ahora, usamos datos de ejemplo
    setTimeout(() => {
      this.appointments = this.getMockAppointments();
      this.applyFilters();
      this.isLoading = false;
    }, 800); // Simulando tiempo de carga
  }

  applyFilters(): void {
    let filtered = [...this.appointments];
    
    // Filtrar por estado
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === this.statusFilter);
    }
    
    // Filtrar por fecha
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(app => {
        const appDate = new Date(app.date);
        return appDate.getFullYear() === filterDate.getFullYear() &&
               appDate.getMonth() === filterDate.getMonth() &&
               appDate.getDate() === filterDate.getDate();
      });
    }
    
    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.doctor.toLowerCase().includes(term) ||
        app.specialty.toLowerCase().includes(term) ||
        app.patient.name.toLowerCase().includes(term) ||
        (app.medicalCenter && app.medicalCenter.toLowerCase().includes(term))
      );
    }
    
    // Ordenar resultados
    filtered = this.sortAppointments(filtered);
    
    this.filteredAppointments = filtered;
  }
  
  sortAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.sort((a, b) => {
      let valA, valB;
      
      // Determinar qué valores comparar según el campo de ordenamiento
      switch(this.sortField) {
        case 'date':
          valA = new Date(`${a.date.toDateString()} ${a.time}`).getTime();
          valB = new Date(`${b.date.toDateString()} ${b.time}`).getTime();
          break;
        case 'doctor':
          valA = a.doctor;
          valB = b.doctor;
          break;
        case 'specialty':
          valA = a.specialty;
          valB = b.specialty;
          break;
        case 'status':
          valA = a.status;
          valB = b.status;
          break;
        case 'patient':
          valA = a.patient.name;
          valB = b.patient.name;
          break;
        default:
          valA = new Date(`${a.date.toDateString()} ${a.time}`).getTime();
          valB = new Date(`${b.date.toDateString()} ${b.time}`).getTime();
      }
      
      // Aplicar la dirección de ordenamiento
      if (this.sortDirection === 'asc') {
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB);
        }
        return valA > valB ? 1 : -1;
      } else {
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valB.localeCompare(valA);
        }
        return valB > valA ? 1 : -1;
      }
    });
  }
  
  changeSort(field: string): void {
    if (this.sortField === field) {
      // Cambiar la dirección si ya estamos ordenando por este campo
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Establecer nuevo campo y dirección predeterminada
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.applyFilters();
  }
  
  resetFilters(): void {
    this.statusFilter = 'all';
    this.dateFilter = '';
    this.searchTerm = '';
    this.applyFilters();
  }
  
  viewAppointmentDetails(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.isViewingDetails = true;
  }
  
  closeDetails(): void {
    this.isViewingDetails = false;
    this.selectedAppointment = null;
  }
  
  // CANCELACIÓN DE CITAS
  openCancelDialog(appointment: Appointment): void {
    this.appointmentToCancel = appointment;
    this.showCancelDialog = true;
  }
  
  closeCancelDialog(): void {
    this.showCancelDialog = false;
    this.appointmentToCancel = null;
    this.cancellationReason = '';
  }
  
  cancelAppointment(): void {
    if (!this.appointmentToCancel || !this.cancellationReason.trim()) {
      return;
    }
    
    // Aquí se realizaría la llamada al servicio para cancelar la cita
    // Simulación de cancelación:
    const index = this.appointments.findIndex(a => a.id === this.appointmentToCancel?.id);
    if (index !== -1) {
      this.appointments[index].status = 'cancelled';
      this.appointments[index].notes = `Motivo de cancelación: ${this.cancellationReason}`;
      
      this.notificationService.success(
        'Cita cancelada',
        'Tu cita ha sido cancelada correctamente'
      );
      
      this.applyFilters();
      this.closeCancelDialog();
    }
  }
  
  // CONFIRMACIÓN DE CITAS
  openConfirmDialog(appointment: Appointment): void {
    this.appointmentToConfirm = appointment;
    this.showConfirmDialog = true;
  }
  
  closeConfirmDialog(): void {
    this.showConfirmDialog = false;
    this.appointmentToConfirm = null;
  }
  
  confirmAppointment(): void {
    if (!this.appointmentToConfirm) {
      return;
    }
    
    // Aquí se realizaría la llamada al servicio para confirmar la cita
    // Simulación de confirmación:
    const index = this.appointments.findIndex(a => a.id === this.appointmentToConfirm?.id);
    if (index !== -1) {
      this.appointments[index].status = 'confirmed';
      this.appointments[index].confirmationDate = new Date();
      
      this.notificationService.success(
        'Cita confirmada',
        'Has confirmado tu asistencia a esta cita'
      );
      
      this.applyFilters();
      this.closeConfirmDialog();
    }
  }
  
  rescheduleAppointment(appointment: Appointment): void {
    // En un entorno real, esta función redireccionaría al formulario de agendamiento
    // con los datos prellenados de la cita actual.
    
    this.notificationService.info(
      'Reprogramar cita',
      'Serás redirigido al formulario de agendamiento...'
    );
    
    // Ejemplo de cómo podría ser la redirección
    // this.router.navigate(['/appointments'], {
    //   queryParams: { reschedule: appointment.id }
    // });
  }
  
  completeAppointment(appointment: Appointment): void {
    // Solo médicos y admins pueden marcar citas como completadas
    if (!this.isDoctor && !this.isAdmin) return;
    
    const index = this.appointments.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      this.appointments[index].status = 'completed';
      
      this.notificationService.success(
        'Cita completada',
        'La cita ha sido marcada como completada'
      );
      
      this.applyFilters();
    }
  }
  
  canCancelAppointment(appointment: Appointment): boolean {
    // Si el usuario es admin, siempre puede cancelar
    if (this.isAdmin) return true;
    
    // Solo permitir cancelar citas programadas o confirmadas
    if (appointment.status !== 'scheduled' && appointment.status !== 'confirmed') {
      return false;
    }
    
    // Si es un médico, puede cancelar sus propias citas
    if (this.isDoctor && this.currentUser && Number(this.currentUser.id) === appointment.doctorId) {
      return true;
    }
    
    // Si es un paciente, verificar que sea su propia cita
    if (!this.isDoctor && this.currentUser && Number(this.currentUser.id) === appointment.patient.id) {
      // Solo permitir cancelar con al menos 24 horas de anticipación
      const appointmentDate = new Date(`${appointment.date.toDateString()} ${appointment.time}`);
      const now = new Date();
      const diffTime = appointmentDate.getTime() - now.getTime();
      const diffHours = diffTime / (1000 * 60 * 60);
      
      return diffHours >= 24;
    }
    
    return false;
  }
  
  canConfirmAppointment(appointment: Appointment): boolean {
    // Solo se pueden confirmar citas programadas (no confirmadas, no canceladas, no completadas)
    if (appointment.status !== 'scheduled') {
      return false;
    }
    
    // Si no es el paciente de la cita, no puede confirmar
    if (this.currentUser && Number(this.currentUser.id) !== appointment.patient.id && !this.isAdmin) {
      return false;
    }
    
    // La cita debe estar dentro de las próximas 48 horas para poder confirmarla
    const appointmentDate = new Date(`${appointment.date.toDateString()} ${appointment.time}`);
    const now = new Date();
    const diffTime = appointmentDate.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    
    // Permitir confirmar citas que sean en menos de 48 horas pero más de 1 hora
    return diffHours <= 48 && diffHours >= 1;
  }
  
  getStatusText(status: string): string {
    switch(status) {
      case 'scheduled': return 'Programada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmada';
      default: return status;
    }
  }
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      default: return '';
    }
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  // Implementación completa del método getMockAppointments()
  getMockAppointments(): Appointment[] {
    const userId = this.currentUser ? Number(this.currentUser.id) : 101;
    const userName = this.currentUser?.name || 'Usuario Actual';
    let appointments: Appointment[] = [];
    
    // Datos base de citas de ejemplo
    const allAppointments: Appointment[] = [
      {
        id: 5001,
        patient: { id: 101, name: 'Ana García' },
        doctorId: 1,
        doctor: 'Dra. Carla Mendoza',
        specialty: 'Cardiología',
        date: new Date('2025-06-15'),
        time: '10:30',
        status: 'scheduled',
        medicalCenter: 'Centro Médico Norte',
        createdAt: new Date('2025-05-20')
      },
      {
        id: 5002,
        patient: { id: 101, name: 'Ana García' },
        doctorId: 2,
        doctor: 'Dr. Roberto Fuentes',
        specialty: 'Neurología',
        date: new Date('2025-06-05'),
        time: '11:45',
        status: 'confirmed',
        confirmationDate: new Date('2025-06-03'),
        medicalCenter: 'Centro Médico Este',
        createdAt: new Date('2025-05-18')
      },
      {
        id: 4998,
        patient: { id: 102, name: 'Juan López' },
        doctorId: 3,
        doctor: 'Dra. Valentina Torres',
        specialty: 'Pediatría',
        date: new Date('2025-05-25'),
        time: '09:15',
        status: 'completed',
        notes: 'Control de rutina. Próxima revisión en 6 meses.',
        medicalCenter: 'Centro Médico Sur',
        createdAt: new Date('2025-05-10')
      },
      {
        id: 4990,
        patient: { id: 101, name: 'Ana García' },
        doctorId: 4,
        doctor: 'Dr. Andrés Soto',
        specialty: 'Traumatología',
        date: new Date('2025-05-15'),
        time: '16:00',
        status: 'cancelled',
        notes: 'Motivo de cancelación: Viaje inesperado',
        medicalCenter: 'Centro Médico Oeste',
        createdAt: new Date('2025-04-30')
      },
      {
        id: 4978,
        patient: { id: 103, name: 'María González' },
        doctorId: 5,
        doctor: 'Dra. María López',
        specialty: 'Dermatología',
        date: new Date('2025-05-10'),
        time: '14:30',
        status: 'completed',
        notes: 'Tratamiento para acné prescrito por 3 meses.',
        medicalCenter: 'Centro Médico Norte',
        createdAt: new Date('2025-04-25')
      },
      {
        id: 4965,
        patient: { id: 102, name: 'Juan López' },
        doctorId: 6,
        doctor: 'Dr. Juan Pérez',
        specialty: 'Medicina General',
        date: new Date('2025-05-03'),
        time: '10:00',
        status: 'completed',
        medicalCenter: 'Centro Médico Este',
        createdAt: new Date('2025-04-20')
      },
      {
        id: 4952,
        patient: { id: 103, name: 'María González' },
        doctorId: 1,
        doctor: 'Dra. Carla Mendoza',
        specialty: 'Cardiología',
        date: new Date('2025-04-20'),
        time: '11:00',
        status: 'completed',
        medicalCenter: 'Centro Médico Oeste',
        createdAt: new Date('2025-04-05')
      },
      {
        id: 5010,
        patient: { id: 104, name: 'Pedro Rodríguez' },
        doctorId: 2,
        doctor: 'Dr. Roberto Fuentes',
        specialty: 'Neurología',
        date: new Date('2025-06-20'),
        time: '09:00',
        status: 'scheduled',
        medicalCenter: 'Centro Médico Norte',
        createdAt: new Date('2025-05-25')
      },
      {
        id: 5011,
        patient: { id: 101, name: 'Ana García' },
        doctorId: 5,
        doctor: 'Dra. María López',
        specialty: 'Dermatología',
        date: (() => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow;
        })(),
        time: '15:30',
        status: 'scheduled',
        medicalCenter: 'Centro Médico Sur',
        createdAt: new Date('2025-05-26')
      }
    ];
    
    // Filtrar citas según el rol
    if (this.isAdmin) {
      // Admin ve todas las citas
      appointments = allAppointments;
    } else if (this.isDoctor) {
      // Doctor ve solo sus citas
      appointments = allAppointments.filter(app => app.doctorId === userId);
    } else {
      // Paciente ve solo sus citas
      appointments = allAppointments.filter(app => app.patient.id === userId);
    }
    
    return appointments;
  }
}