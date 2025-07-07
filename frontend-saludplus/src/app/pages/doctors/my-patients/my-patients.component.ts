import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { AppointmentsService } from '../../../services/appointments.service';
import { HttpClient } from '@angular/common/http';

interface Patient {
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
}

@Component({
  selector: 'app-my-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-patients.component.html',
  styleUrls: ['./my-patients.component.css']
})
export class MyPatientsComponent implements OnInit, OnDestroy {
  // Tabs y filtros
  activeTab: 'today' | 'upcoming' | 'all' = 'today';
  searchTerm: string = '';
  filterStatus: string = '';

  // Listas de pacientes/citas
  allPatients: Patient[] = [];
  todayPatients: Patient[] = [];
  upcomingPatients: Patient[] = [];
  filteredPatients: Patient[] = [];

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
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadDoctorPatients();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadDoctorPatients() {
    console.log('👨‍⚕️ Loading doctor patients...');
    this.isLoading = true;

    // Cargar directamente desde la API
    this.http.get<Patient[]>('http://localhost:8000/api/appointments/')
      .subscribe({
        next: (appointments) => {
          console.log('✅ Appointments loaded:', appointments);
          const doctorAppointments = this.filterDoctorAppointments(appointments);
          this.allPatients = this.formatPatients(doctorAppointments);
          this.categorizePatients();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error loading patients:', error);
          this.loadMockData();
        }
      });
  }

  filterDoctorAppointments(appointments: any[]): any[] {
    if (!this.currentUser) return [];
    
    return appointments.filter(apt => 
      apt.doctor?.id === this.currentUser.id || 
      apt.doctorId === this.currentUser.id ||
      apt.doctor_id === this.currentUser.id
    );
  }

  formatPatients(appointments: any[]): Patient[] {
    return appointments.map(apt => ({
      id: apt.id,
      patientName: apt.patient?.name || apt.patientName || apt.patient_name || 'Paciente Desconocido',
      doctorName: this.currentUser?.name || 'Doctor',
      doctorSpecialty: this.currentUser?.specialty || 'Medicina General',
      date: apt.date,
      time: apt.time,
      reason: apt.reason || 'Consulta general',
      priority: apt.priority || 'medium',
      status: apt.status || 'scheduled',
      notes: apt.notes || '',
      location: apt.location || 'Consulta Externa'
    }));
  }

  loadMockData() {
    console.log('🧪 Loading mock patient data...');
    this.allPatients = [
      
    ];

    this.categorizePatients();
    this.applyFilters();
    this.isLoading = false;
  }

  categorizePatients() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    this.todayPatients = this.allPatients.filter(patient => 
      patient.date === todayString && patient.status !== 'cancelled'
    );

    this.upcomingPatients = this.allPatients.filter(patient => {
      const patientDate = new Date(patient.date);
      return patientDate > today && patient.status === 'scheduled';
    });
  }

  setActiveTab(tab: 'today' | 'upcoming' | 'all') {
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters() {
    let patients: Patient[] = [];

    switch (this.activeTab) {
      case 'today':
        patients = [...this.todayPatients];
        break;
      case 'upcoming':
        patients = [...this.upcomingPatients];
        break;
      case 'all':
        patients = [...this.allPatients];
        break;
    }

    if (this.searchTerm) {
      patients = patients.filter(patient =>
        patient.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patient.reason.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.filterStatus) {
      patients = patients.filter(patient => patient.status === this.filterStatus);
    }

    this.filteredPatients = patients;
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  getUniqueStatuses(): string[] {
    const statuses = this.allPatients.map(p => p.status);
    return [...new Set(statuses)];
  }

  // Métodos auxiliares
  getDateDay(dateString: string): string {
    return new Date(dateString).getDate().toString();
  }

  getDateMonth(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', { month: 'short' });
  }

  getDateYear(dateString: string): string {
    return new Date(dateString).getFullYear().toString();
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'scheduled': '#3b82f6',
      'confirmed': '#10b981',
      'in-progress': '#f59e0b',
      'completed': '#6b7280',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'scheduled': 'Agendada',
      'confirmed': 'Confirmada',
      'in-progress': 'En Curso',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return texts[status] || status;
  }

  // Métodos de acciones
  startConsultation(patientId: number) {
    console.log('Iniciando consulta con paciente:', patientId);
  }

  viewPatientHistory(patientId: number) {
    console.log('Viendo historial del paciente:', patientId);
  }

  cancelAppointment(patientId: number) {
    if (confirm('¿Está seguro de que desea cancelar esta cita?')) {
      console.log('Cancelando cita del paciente:', patientId);
    }
  }

  canCancel(patient: Patient): boolean {
    return patient.status === 'scheduled' || patient.status === 'confirmed';
  }

  canStart(patient: Patient): boolean {
    const today = new Date().toISOString().split('T')[0];
    return patient.date === today && patient.status === 'scheduled';
  }
}