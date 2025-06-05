import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';

interface Appointment {
  id: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
  patientAge?: number;
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  currentUser: User | null = null;
  searchTerm: string = '';
  statusFilter: string = '';
  dateFilter: string = '';

  // Datos del médico
  doctor = {
    name: '',
    specialty: '',
    license: ''
  };

  // Estadísticas
  stats = {
    total: 45,
    scheduled: 8,
    completed: 35,
    cancelled: 2
  };

  // Todas las citas
  allAppointments: Appointment[] = [
    {
      id: 1,
      patientName: 'María García',
      patientEmail: 'maria.garcia@email.com',
      patientPhone: '+57 301 234 5678',
      date: '2025-05-29',
      time: '09:00',
      status: 'scheduled',
      reason: 'Control cardiológico',
      patientAge: 45
    },
    {
      id: 2,
      patientName: 'Juan Pérez',
      patientEmail: 'juan.perez@email.com',
      patientPhone: '+57 302 345 6789',
      date: '2025-05-29',
      time: '11:30',
      status: 'scheduled',
      reason: 'Dolor en el pecho',
      patientAge: 52
    },
    {
      id: 3,
      patientName: 'Ana López',
      patientEmail: 'ana.lopez@email.com',
      patientPhone: '+57 303 456 7890',
      date: '2025-05-29',
      time: '14:00',
      status: 'completed',
      reason: 'Seguimiento post-operatorio',
      patientAge: 38,
      notes: 'Evolución favorable. Continuar tratamiento actual.'
    },
    {
      id: 4,
      patientName: 'Carlos Rodríguez',
      patientEmail: 'carlos.rodriguez@email.com',
      patientPhone: '+57 304 567 8901',
      date: '2025-05-30',
      time: '10:00',
      status: 'scheduled',
      reason: 'Primera consulta',
      patientAge: 29
    }
  ];

  // Propiedades calculadas
  todayAppointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  currentDate = new Date();
  calendarDays: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.doctor = {
          name: user.name || 'Doctor',
          specialty: user.specialty || 'Especialidad',
          license: user.license || 'N/A'
        };
      }
    });

    this.loadTodayAppointments();
    this.filteredAppointments = [...this.allAppointments];
    this.generateCalendar();
  }

  loadTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    this.todayAppointments = this.allAppointments.filter(apt => apt.date === today);
  }

  // Métodos de filtrado
  onSearchChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onDateFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredAppointments = this.allAppointments.filter(appointment => {
      const matchesSearch = !this.searchTerm || 
        appointment.patientName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || 
        appointment.status === this.statusFilter;
      
      const matchesDate = !this.dateFilter || 
        appointment.date === this.dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.dateFilter = '';
    this.filteredAppointments = [...this.allAppointments];
  }

  // Acciones de citas
  completeAppointment(id: number) {
    const appointment = this.allAppointments.find(apt => apt.id === id);
    if (appointment) {
      appointment.status = 'completed';
      this.loadTodayAppointments();
      this.applyFilters();
    }
  }

  cancelAppointment(id: number) {
    if (confirm('¿Está seguro de cancelar esta cita?')) {
      const appointment = this.allAppointments.find(apt => apt.id === id);
      if (appointment) {
        appointment.status = 'cancelled';
        this.loadTodayAppointments();
        this.applyFilters();
      }
    }
  }

  addNotes(id: number) {
    const notes = prompt('Ingrese las notas de la consulta:');
    if (notes) {
      const appointment = this.allAppointments.find(apt => apt.id === id);
      if (appointment) {
        appointment.notes = notes;
      }
    }
  }

  // Métodos auxiliares
  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'scheduled': return 'Agendada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  // Calendario (simplificado)
  generateCalendar() {
    // Implementación básica del calendario
    this.calendarDays = [];
    // Aquí puedes agregar la lógica del calendario si la necesitas
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  selectDate(date: Date) {
    this.dateFilter = date.toISOString().split('T')[0];
    this.applyFilters();
  }
}