import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';
import { SharedAppointmentsService } from '../../../services/shared-appointments.service';
import { Subscription } from 'rxjs';

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
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
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
  totalAppointments: number = 0;
  completedAppointments: number = 0;
  pendingAppointments: number = 0;
  cancelledAppointments: number = 0;
  
  // Para desuscribirse al destruir el componente
  private appointmentSubscription: Subscription | undefined;
  
  // Propiedades para editar perfil
  showProfileForm = false;
  editingUser: Partial<User> = {};
  allergiesText = '';
  chronicText = '';
  
  constructor(
    private authService: AuthService,
    private appointmentsService: SharedAppointmentsService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Asegurar que currentUser existe antes de usarlo
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.currentUser = user;
        // Realizar otras inicializaciones que dependan del usuario
      } else {
        // Redirigir al login si no hay usuario
        this.router.navigate(['/login']);
      }
    });
    
    // Obtener el usuario actual
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      // Extraer ID numérico
      let userId: number;
      
      if (typeof currentUser.id === 'string' && currentUser.id.includes('-')) {
        userId = parseInt(currentUser.id.split('-')[1], 10);
      } else {
        userId = parseInt(currentUser.id as string, 10);
      }
      
      console.log('Dashboard: Obteniendo citas para usuario ID:', userId);
      
      // Suscribirse a los cambios de citas para este paciente
      this.appointmentSubscription = this.appointmentsService
        .getPatientAppointments(userId)
        .subscribe(appointments => {
          console.log('Dashboard: Citas obtenidas:', appointments.length);
          
          // Actualizar las estadísticas basadas en las citas reales
          this.totalAppointments = appointments.length;
          
          // Contar por estado
          this.completedAppointments = appointments.filter(apt => 
            apt.status === 'completed'
          ).length;
          
          this.pendingAppointments = appointments.filter(apt => 
            ['scheduled', 'confirmed', 'pending'].includes(apt.status as string)
          ).length;
          
          this.cancelledAppointments = appointments.filter(apt => 
            apt.status === 'cancelled'
          ).length;
        });
    }
  }
  
  ngOnDestroy() {
    // Limpiar suscripciones
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe();
    }
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

  // MÉTODOS DE ACCIÓN - EDITAR PERFIL
  editProfile() {
    this.showProfileForm = true;
    this.editingUser = { ...this.currentUser };
    
    // Convertir arrays a texto para el formulario
    this.allergiesText = this.currentUser?.allergies?.join(', ') || '';
    this.chronicText = this.currentUser?.chronic?.join(', ') || '';
  }

  // Cancelar edición de perfil
  cancelEditProfile() {
    this.showProfileForm = false;
    this.editingUser = {};
    this.allergiesText = '';
    this.chronicText = '';
  }

  // Guardar cambios en el perfil
  saveProfile() {
    if (!this.editingUser || !this.currentUser) return;
    
    // Convertir texto a arrays
    const allergies = this.allergiesText
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
      
    const chronic = this.chronicText
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');
    
    // Crear objeto con datos actualizados
    const updatedUser: User = {
      ...this.currentUser,
      ...this.editingUser,
      allergies,
      chronic
    };
    
    // Actualizar en el servicio
    this.authService.updateCurrentUser(updatedUser);
    
    // Cerrar formulario
    this.showProfileForm = false;
    
    // Mensaje de confirmación
    alert('Perfil actualizado correctamente');
  }

  // Calcular edad a partir de la fecha de nacimiento
  calculateAge(birthdate?: string): number | null {
    if (!birthdate) return null;
    
    try {
      const today = new Date();
      const birthDate = new Date(birthdate);
      
      if (isNaN(birthDate.getTime())) return null;
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return null;
    }
  }

  // Método para mapear valores de género
  getGenderText(gender?: string): string {
    if (!gender) return 'No especificado';
    
    const genderMap: Record<string, string> = {
      'M': 'Masculino',
      'F': 'Femenino', 
      'O': 'Otro'
    };
    
    return genderMap[gender] || 'No especificado';
  }
}