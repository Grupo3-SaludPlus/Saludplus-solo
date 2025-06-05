import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Appointment {
  id: number;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

@Component({
  selector: 'app-appointments-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments-history.component.html',
  styleUrl: './appointments-history.component.css'
})
export class AppointmentsHistoryComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  dateFilter: string = '';
  upcomingAppointment: Appointment | null = null;
  
  ngOnInit(): void {
    // Simulando datos que vendrían de una API
    this.appointments = [
      {
        id: 1,
        doctorName: 'Dra. Carla Mendoza',
        doctorSpecialty: 'Cardiología',
        date: '2025-06-15',
        time: '10:00',
        status: 'scheduled'
      },
      {
        id: 2,
        doctorName: 'Dr. Roberto Fuentes',
        doctorSpecialty: 'Neurología',
        date: '2025-05-28',
        time: '09:30',
        status: 'scheduled'
      },
      {
        id: 3,
        doctorName: 'Dra. Valentina Torres',
        doctorSpecialty: 'Pediatría',
        date: '2025-04-20',
        time: '11:00',
        status: 'completed',
        notes: 'Control de rutina. Se recomendó aumentar ingesta de líquidos y hacer seguimiento en 6 meses.'
      },
      {
        id: 4,
        doctorName: 'Dr. Andrés Soto',
        doctorSpecialty: 'Traumatología',
        date: '2025-03-10',
        time: '15:30',
        status: 'completed',
        notes: 'Rehabilitación de rodilla. Se prescribieron ejercicios y fisioterapia por 2 semanas.'
      },
      {
        id: 5,
        doctorName: 'Dra. María López',
        doctorSpecialty: 'Dermatología',
        date: '2025-02-05',
        time: '12:00',
        status: 'cancelled'
      }
    ];
    
    this.filteredAppointments = [...this.appointments];
    this.checkUpcomingAppointments();
    this.sortAppointmentsByDate();
  }
  
  checkUpcomingAppointments(): void {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    // Encuentra la cita más próxima que está dentro de los próximos 7 días
    this.upcomingAppointment = this.appointments.find(app => {
      const appDate = new Date(app.date);
      return app.status === 'scheduled' && 
             appDate >= today && 
             appDate <= nextWeek;
    }) || null;
  }
  
  sortAppointmentsByDate(): void {
    this.filteredAppointments.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB.getTime() - dateA.getTime(); // Orden descendente (más reciente primero)
    });
  }
  
  filterAppointments(): void {
    this.filteredAppointments = this.appointments.filter(appointment => {
      // Filtro por término de búsqueda
      const matchesSearch = this.searchTerm ? 
        appointment.doctorName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        appointment.doctorSpecialty.toLowerCase().includes(this.searchTerm.toLowerCase()) :
        true;
      
      // Filtro por estado
      const matchesStatus = this.statusFilter ? 
        appointment.status === this.statusFilter :
        true;
      
      // Filtro por fecha
      const matchesDate = this.dateFilter ?
        appointment.date === this.dateFilter :
        true;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    this.sortAppointmentsByDate();
  }
  
  onSearchChange(): void {
    this.filterAppointments();
  }
  
  onStatusFilterChange(): void {
    this.filterAppointments();
  }
  
  onDateFilterChange(): void {
    this.filterAppointments();
  }
  
  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.dateFilter = '';
    this.filteredAppointments = [...this.appointments];
    this.sortAppointmentsByDate();
  }
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
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
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}