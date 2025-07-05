import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AppointmentsService } from '../../../services/appointments.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  reason: string;
  priority: string;
  status: string;
  notes?: string;
  location?: string;
  doctor_name?: string;  // Alias para compatibilidad
  specialty?: string;    // Alias para compatibilidad
}

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.css']
})
export class MyAppointmentsComponent implements OnInit, OnDestroy {
  // Tabs y filtros
  activeTab: 'upcoming' | 'history' | 'all' = 'upcoming';
  searchTerm: string = '';
  filterSpecialty: string = '';
  filterDoctor: string = '';

  // Listas de citas
  allAppointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  historyAppointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];

  // Estadísticas
  completedAppointmentsCount: number = 0;
  cancelledAppointmentsCount: number = 0;

  // Modal de reagendar
  showRescheduleModal: boolean = false;
  selectedAppointmentId: number | null = null;

  // Usuario actual
  currentUser: any = null;
  isLoading = true;

  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private appointmentsService: AppointmentsService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    console.log('🔍 MyAppointments component initialized');
    
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        console.log('👤 Current user:', user);
        this.currentUser = user;
        if (user) {
          this.loadUserAppointments();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadUserAppointments() {
    console.log('📅 Loading appointments...');
    this.isLoading = true;

    // ✅ CARGAR DIRECTAMENTE DESDE LA API
    this.http.get<Appointment[]>('http://localhost:8000/api/appointments/')
      .subscribe({
        next: (appointments) => {
          console.log('✅ Appointments loaded:', appointments);
          this.allAppointments = this.formatAppointments(appointments);
          this.categorizeAppointments();
          this.calculateStatistics();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading appointments:', error);
          this.isLoading = false;
          // ✅ DATOS DE PRUEBA si falla la API
          this.loadMockData();
        }
      });
  }

  formatAppointments(appointments: any[]): Appointment[] {
    return appointments.map(apt => ({
      id: apt.id,
      patientName: apt.patient?.name || apt.patientName || 'Paciente Desconocido',
      doctorName: apt.doctor?.name || apt.doctorName || apt.doctor_name || 'Doctor Desconocido',
      doctorSpecialty: apt.doctor?.specialty || apt.doctorSpecialty || apt.specialty || 'Especialidad Desconocida',
      date: apt.date,
      time: apt.time,
      reason: apt.reason || 'Consulta general',
      priority: apt.priority || 'medium',
      status: apt.status || 'scheduled',
      notes: apt.notes || '',
      location: apt.location || 'Consulta Externa',
      doctor_name: apt.doctor?.name || apt.doctorName || apt.doctor_name,
      specialty: apt.doctor?.specialty || apt.doctorSpecialty || apt.specialty
    }));
  }

  loadMockData() {
    console.log('🧪 Loading mock data...');
    this.allAppointments = [
      {
        id: 1,
        patientName: 'Juan Pérez',
        doctorName: 'Dr. María García',
        doctorSpecialty: 'Cardiología',
        date: '2025-07-10',
        time: '10:00',
        reason: 'Control rutinario',
        priority: 'medium',
        status: 'scheduled',
        location: 'Consulta Externa - Piso 2',
        doctor_name: 'Dr. María García',
        specialty: 'Cardiología'
      },
      {
        id: 2,
        patientName: 'Juan Pérez',
        doctorName: 'Dra. Ana López',
        doctorSpecialty: 'Medicina General',
        date: '2025-06-15',
        time: '14:30',
        reason: 'Consulta general',
        priority: 'low',
        status: 'completed',
        location: 'Consulta Externa - Piso 1',
        doctor_name: 'Dra. Ana López',
        specialty: 'Medicina General'
      },
      {
        id: 3,
        patientName: 'Juan Pérez',
        doctorName: 'Dr. Carlos Ruiz',
        doctorSpecialty: 'Traumatología',
        date: '2025-07-20',
        time: '16:00',
        reason: 'Dolor en rodilla',
        priority: 'high',
        status: 'scheduled',
        location: 'Consulta Externa - Piso 3',
        doctor_name: 'Dr. Carlos Ruiz',
        specialty: 'Traumatología'
      }
    ];

    this.categorizeAppointments();
    this.calculateStatistics();
    this.applyFilters();
    this.isLoading = false;
  }

  categorizeAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.upcomingAppointments = this.allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && (apt.status === 'scheduled' || apt.status === 'confirmed');
    });

    this.historyAppointments = this.allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled';
    });

    console.log('📊 Categorized appointments:');
    console.log('📅 Upcoming:', this.upcomingAppointments);
    console.log('📚 History:', this.historyAppointments);
  }

  calculateStatistics() {
    this.completedAppointmentsCount = this.allAppointments.filter(apt => apt.status === 'completed').length;
    this.cancelledAppointmentsCount = this.allAppointments.filter(apt => apt.status === 'cancelled').length;
  }

  setActiveTab(tab: 'upcoming' | 'history' | 'all') {
    console.log('📑 Setting active tab:', tab);
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters() {
    let appointments: Appointment[] = [];

    // ✅ SELECCIONAR CITAS SEGÚN LA PESTAÑA ACTIVA
    switch (this.activeTab) {
      case 'upcoming':
        appointments = [...this.upcomingAppointments];
        break;
      case 'history':
        appointments = [...this.historyAppointments];
        break;
      case 'all':
        appointments = [...this.allAppointments];
        break;
    }

    // ✅ APLICAR FILTROS
    this.filteredAppointments = appointments.filter(apt => {
      const matchesSearch = !this.searchTerm || 
        apt.doctorName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        apt.doctorSpecialty.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        apt.reason.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesSpecialty = !this.filterSpecialty || 
        apt.doctorSpecialty === this.filterSpecialty;

      const matchesDoctor = !this.filterDoctor || 
        apt.doctorName === this.filterDoctor;

      return matchesSearch && matchesSpecialty && matchesDoctor;
    });

    console.log('🔍 Filtered appointments:', this.filteredAppointments);
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterSpecialty = '';
    this.filterDoctor = '';
    this.applyFilters();
  }

  getUniqueSpecialties(): string[] {
    return [...new Set(this.allAppointments.map(a => a.doctorSpecialty))];
  }

  getUniqueDoctors(): string[] {
    return [...new Set(this.allAppointments.map(a => a.doctorName))];
  }

  // ✅ MÉTODOS UTILITARIOS
  getDateDay(date: string): string {
    return new Date(date).getDate().toString().padStart(2, '0');
  }

  getDateMonth(date: string): string {
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return months[new Date(date).getMonth()];
  }

  getDateYear(date: string): string {
    return new Date(date).getFullYear().toString();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'scheduled': return '#2563eb';
      case 'confirmed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'confirmed': return 'Confirmada';
      case 'in-progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CL');
  }

  rescheduleAppointment(id: number) {
    this.selectedAppointmentId = id;
    this.showRescheduleModal = true;
  }

  cancelAppointment(id: number) {
    console.log('Cancelar cita:', id);
  }

  canCancel(appointment: Appointment): boolean {
    return appointment.status === 'scheduled' || appointment.status === 'confirmed';
  }

  joinAppointment(id: number) {
    console.log('Unirse a consulta:', id);
  }
}