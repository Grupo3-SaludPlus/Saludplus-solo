import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface AppointmentDetails {
  id: number;
  specialty: string;
  doctor: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
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
export class MyAppointmentsComponent implements OnInit {
  activeTab: 'upcoming' | 'history' | 'all' = 'upcoming';
  
  // Todas las citas del paciente
  allAppointments: AppointmentDetails[] = [
    {
      id: 1,
      specialty: 'Cardiología',
      doctor: 'Dra. Carla Mendoza',
      date: '2025-06-15',
      time: '10:00',
      status: 'confirmed',
      reason: 'Control rutinario',
      location: 'Consulta 301'
    },
    {
      id: 2,
      specialty: 'Medicina General',
      doctor: 'Dr. Juan Pérez',
      date: '2025-06-20',
      time: '14:30',
      status: 'pending',
      reason: 'Chequeo general',
      location: 'Consulta 102'
    },
    {
      id: 3,
      specialty: 'Neurología',
      doctor: 'Dr. Roberto Fuentes',
      date: '2025-05-20',
      time: '09:00',
      status: 'completed',
      reason: 'Dolor de cabeza recurrente',
      location: 'Consulta 205'
    },
    {
      id: 4,
      specialty: 'Dermatología',
      doctor: 'Dra. María López',
      date: '2025-05-10',
      time: '16:00',
      status: 'completed',
      reason: 'Revisión de lunar',
      location: 'Consulta 401'
    },
    {
      id: 5,
      specialty: 'Traumatología',
      doctor: 'Dr. Andrés Soto',
      date: '2025-04-25',
      time: '11:30',
      status: 'cancelled',
      reason: 'Dolor en rodilla',
      location: 'Consulta 503'
    }
  ];

  // Filtros
  filterSpecialty = '';
  filterDoctor = '';
  searchTerm = '';

  // Listas calculadas
  filteredAppointments: AppointmentDetails[] = [];
  upcomingAppointments: AppointmentDetails[] = [];
  historyAppointments: AppointmentDetails[] = [];

  ngOnInit() {
    this.calculateAppointmentLists();
    this.applyFilters();
  }

  calculateAppointmentLists() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.upcomingAppointments = this.allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && (apt.status === 'confirmed' || apt.status === 'pending');
    });

    this.historyAppointments = this.allAppointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled';
    });
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

  canCancel(appointment: AppointmentDetails): boolean {
    const aptDate = new Date(appointment.date);
    const today = new Date();
    const diffDays = Math.ceil((aptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays >= 1 && (appointment.status === 'confirmed' || appointment.status === 'pending');
  }

  cancelAppointment(appointmentId: number) {
    const confirmed = confirm('¿Estás seguro de que deseas cancelar esta cita?');
    if (confirmed) {
      const appointment = this.allAppointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        appointment.status = 'cancelled';
        this.calculateAppointmentLists();
        this.applyFilters();
        alert('Cita cancelada exitosamente');
      }
    }
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
}