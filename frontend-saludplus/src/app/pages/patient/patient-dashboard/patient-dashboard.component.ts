import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';

interface Appointment {
  id: number;
  specialty: string;
  doctor: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit {
  currentUser: User | null = null;
  
  // Próximas citas (máximo 3)
  upcomingAppointments: Appointment[] = [
    {
      id: 1,
      specialty: 'Cardiología',
      doctor: 'Dra. Carla Mendoza',
      date: '2025-06-15',
      time: '10:00',
      status: 'confirmed'
    },
    {
      id: 2,
      specialty: 'Medicina General',
      doctor: 'Dr. Juan Pérez',
      date: '2025-06-20',
      time: '14:30',
      status: 'pending'
    }
  ];

  // Estadísticas básicas
  totalAppointments = 15;
  completedAppointments = 12;
  pendingAppointments = 2;
  cancelledAppointments = 1;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  // MÉTODOS PARA FECHAS
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

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

  // MÉTODOS PARA ESTADOS
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

  // MÉTODOS DE ACCIÓN - ESTOS ESTABAN FALTANDO
  editProfile() {
    alert('Función de editar perfil en desarrollo');
    // Aquí puedes abrir un modal o navegar a una página de edición
  }

  changePassword() {
    alert('Función de cambiar contraseña en desarrollo');
    // Aquí puedes abrir un modal para cambiar contraseña
  }
}