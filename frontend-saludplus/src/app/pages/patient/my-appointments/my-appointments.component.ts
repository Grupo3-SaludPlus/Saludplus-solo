import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SharedAppointmentsService, AppointmentBase } from '../../../services/shared-appointments.service';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

interface AppointmentDetails {
  id: number;
  specialty: string;
  doctor: string;
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'pending';
  reason: string;
  location: string;
}

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './my-appointments.component.html',
  styleUrl: './my-appointments.component.css'
})
export class MyAppointmentsComponent implements OnInit, OnDestroy {
  activeTab: 'upcoming' | 'history' | 'all' = 'upcoming';
  
  // Todas las citas del paciente
  allAppointments: AppointmentDetails[] = [];

  // Filtros
  filterSpecialty = '';
  filterDoctor = '';
  searchTerm = '';

  // Listas calculadas
  filteredAppointments: AppointmentDetails[] = [];
  upcomingAppointments: AppointmentDetails[] = [];
  historyAppointments: AppointmentDetails[] = [];

  currentUser: any; // Almacena el usuario actual
  appointmentSubscription: Subscription | undefined; // Almacena la suscripción a las citas
  loading: boolean = true; // Nueva propiedad para controlar la carga
  noAppointmentsMessage: string = ''; // Mensaje para mostrar cuando no hay citas

  constructor(
    private authService: AuthService,
    private appointmentsService: SharedAppointmentsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Obtener usuario actual
    this.currentUser = this.authService.currentUserValue;
    
    // Comprobar si estamos en el navegador antes de usar localStorage o llamar a métodos que lo usan
    if (isPlatformBrowser(this.platformId)) {
      // Ahora es seguro llamar a debugAppointments() y otros métodos que usan localStorage
      this.loadAppointments();
      this.appointmentsService.debugAppointments();
    }
  }

  // Método separado para cargar las citas
  private loadAppointments(): void {
    if (this.currentUser) {
      // Código existente para usuarios autenticados...
      let userId: number;
      
      // Si el ID tiene formato "patient-XXX", extraer el número
      if (typeof this.currentUser.id === 'string' && this.currentUser.id.includes('-')) {
        userId = parseInt(this.currentUser.id.split('-')[1], 10);
      } else {
        // Si es un ID simple, intentar convertirlo directamente
        userId = parseInt(this.currentUser.id as string, 10);
      }
      
      console.log('Buscando citas para usuario ID:', userId);
      
      // Cargar citas del servicio
      this.appointmentSubscription = this.appointmentsService
        .getPatientAppointments(userId)
        .subscribe(appointments => {
          // Código existente...
          this.processAppointments(appointments);
        });
    } else {
      // Usuario no autenticado - mostrar citas de invitado
      this.appointmentSubscription = this.appointmentsService
        .getGuestAppointments()
        .subscribe(appointments => {
          console.log('Citas de invitado cargadas:', appointments);
          if (appointments.length === 0) {
            // Mensaje cuando no hay citas
            this.noAppointmentsMessage = 'No se encontraron citas. Para ver sus citas, primero debe agendar una.';
          } else {
            this.processAppointments(appointments);
          }
        });
    }
  }
  
  // Método auxiliar para procesar citas
  private processAppointments(appointments: AppointmentBase[]) {
    // Mapear desde AppointmentBase a AppointmentDetails
    this.allAppointments = appointments.map((apt: AppointmentBase) => ({
      id: apt.id,
      specialty: apt.specialty,
      doctor: apt.doctorName, 
      date: apt.date,
      time: apt.time,
      status: apt.status as 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'pending',
      reason: apt.reason || '',
      location: apt.location || 'Sin asignar'
    }));
    
    console.log('Citas mapeadas:', this.allAppointments);
    
    // Procesar las citas
    this.calculateAppointmentLists();
    this.applyFilters();
    this.loading = false;
  }

  calculateAppointmentLists() {
    const today = new Date().toISOString().split('T')[0];
    
    // Filtrar citas próximas (fecha >= hoy)
    this.upcomingAppointments = this.allAppointments.filter(apt => 
      apt.date >= today && apt.status !== 'cancelled' && apt.status !== 'completed'
    );
    
    // Filtrar citas históricas (completadas o canceladas, o fecha < hoy)
    this.historyAppointments = this.allAppointments.filter(apt => 
      apt.date < today || apt.status === 'cancelled' || apt.status === 'completed'
    );
    
    // Aplicar filtros actuales
    this.applyFilters();
  }

  setActiveTab(tab: 'upcoming' | 'history' | 'all') {
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters() {
    let appointments: AppointmentDetails[];
    
    switch(this.activeTab) {
      case 'upcoming':
        appointments = this.upcomingAppointments;
        break;
      case 'history':
        appointments = this.historyAppointments;
        break;
      default:
        appointments = this.allAppointments;
    }

    this.filteredAppointments = appointments.filter(apt => {
      const matchesSpecialty = !this.filterSpecialty || apt.specialty === this.filterSpecialty;
      const matchesDoctor = !this.filterDoctor || apt.doctor === this.filterDoctor;
      const matchesSearch = !this.searchTerm || 
        apt.specialty.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        apt.doctor.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        apt.reason.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesSpecialty && matchesDoctor && matchesSearch;
    });
  }

  clearFilters() {
    this.filterSpecialty = '';
    this.filterDoctor = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocido';
    }
  }

  // ASEGÚRATE DE QUE ESTOS MÉTODOS ESTÉN PRESENTES:
  getDateDay(dateString: string): string {
    const date = new Date(dateString);
    return date.getDate().toString().padStart(2, '0');
  }

  getDateMonth(dateString: string): string {
    const date = new Date(dateString);
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                    'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return months[date.getMonth()];
  }

  getDateYear(dateString: string): string {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Propiedades calculadas para evitar .filter() en template
  get completedAppointmentsCount(): number {
    return this.historyAppointments.filter(a => a.status === 'completed').length;
  }

  get cancelledAppointmentsCount(): number {
    return this.historyAppointments.filter(a => a.status === 'cancelled').length;
  }

  // Método para cancelar una cita
  cancelAppointment(id: number) {
    if (confirm('¿Está seguro de que desea cancelar esta cita?')) {
      this.appointmentsService.cancelAppointment(
        id, 
        'Cancelada por el paciente'
      );
    }
  }

  // Verificar si una cita puede ser cancelada
  canCancel(appointment: AppointmentDetails): boolean {
    return ['scheduled', 'confirmed', 'pending'].includes(appointment.status);
  }

  rescheduleAppointment(appointmentId: number) {
    // Aquí puedes redirigir al formulario de reagendar
    alert('Función de reagendar en desarrollo');
  }

  getUniqueSpecialties(): string[] {
    return [...new Set(this.allAppointments.map(apt => apt.specialty))];
  }

  getUniqueDoctors(): string[] {
    return [...new Set(this.allAppointments.map(apt => apt.doctor))];
  }

  // Agregar este método a la clase MyAppointmentsComponent
  joinAppointment(appointmentId: number) {
    // Implementación para unirse a una consulta virtual
    alert('Conectando a la consulta virtual... Esta funcionalidad está en desarrollo.');
    // Aquí se podría redirigir a una sala de videoconferencia o abrir un componente modal
  }

  ngOnDestroy() {
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe();
    }
  }
}