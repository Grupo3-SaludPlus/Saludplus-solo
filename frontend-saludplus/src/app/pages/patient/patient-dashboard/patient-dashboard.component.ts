import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AppointmentsService } from '../../../services/appointments.service';
import { User, Appointment } from '../../../services/api.service';
import { Subscription } from 'rxjs';

// ✅ INTERFACE SIMPLIFICADA
interface EditableUser {
  phone: string;
  birthdate: string;
  gender: 'M' | 'F' | 'O';
  bloodType: string;
  emergencyContact: string;
  allergies: string[];
  chronic: string[];
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
  host: { 'class': 'full-width-dashboard' }, // Añade esta clase al host
  providers: [AuthService, AppointmentsService],
  encapsulation: ViewEncapsulation.None  // Importante: deshabilita la encapsulación
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  
  editingUser: EditableUser = {
    phone: '',
    birthdate: '',
    gender: 'O',
    bloodType: '',
    emergencyContact: '',
    allergies: [],
    chronic: []
  };
  
  appointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  isEditMode = false;
  allergiesText = '';
  chronicText = '';
  showProfileForm = false;
  isLoading: boolean = true;

  // Estadísticas calculadas
  totalAppointments = 0;
  completedAppointments = 0;
  pendingAppointments = 0;
  cancelledAppointments = 0;
  
  private userSubscription?: Subscription;
  private appointmentsSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private appointmentsService: AppointmentsService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.loadUserAppointments();
        this.setupEditingUser();
        this.loadDashboardData();
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.appointmentsSubscription?.unsubscribe();
  }

  private loadUserAppointments() {
    if (!this.currentUser) return;

    this.appointmentsService.getPatientAppointments(Number(this.currentUser.id))
      .subscribe((appointments: Appointment[]) => {
        this.appointments = appointments;
        this.calculateStatistics();
        this.isLoading = false;
      });
  }

  private calculateStatistics() {
    this.totalAppointments = this.appointments.length;
    this.completedAppointments = this.appointments.filter(apt => apt.status === 'completed').length;
    this.pendingAppointments = this.appointments.filter(apt => 
      apt.status === 'scheduled' || apt.status === 'confirmed'
    ).length;
    this.cancelledAppointments = this.appointments.filter(apt => apt.status === 'cancelled').length;
  }

  private setupEditingUser() {
    if (this.currentUser) {
      const validGender = this.currentUser.gender === 'M' || this.currentUser.gender === 'F' || this.currentUser.gender === 'O' 
        ? this.currentUser.gender 
        : 'O';

      this.editingUser = {
        phone: this.currentUser.phone || '',
        birthdate: this.currentUser.birthdate || '',
        gender: validGender,
        bloodType: this.currentUser.bloodType || '',
        emergencyContact: this.currentUser.emergencyContact || '',
        allergies: this.currentUser.allergies || [],
        chronic: this.currentUser.chronic || []
      };
      
      this.allergiesText = this.editingUser.allergies.join(', ');
      this.chronicText = this.editingUser.chronic.join(', ');
    } else {
      this.editingUser = {
        phone: '',
        birthdate: '',
        gender: 'O',
        bloodType: '',
        emergencyContact: '',
        allergies: [],
        chronic: []
      };
      this.allergiesText = '';
      this.chronicText = '';
    }
  }

  editProfile() {
    this.showProfileForm = true;
    this.isEditMode = true;
    this.setupEditingUser();
  }

  cancelEditProfile() {
    this.showProfileForm = false;
    this.isEditMode = false;
    this.setupEditingUser();
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.setupEditingUser();
    }
  }

  saveProfile() {
    if (!this.currentUser) return;

    const allergies = this.allergiesText.split(',').map(a => a.trim()).filter(a => a);
    const chronic = this.chronicText.split(',').map(c => c.trim()).filter(c => c);

    const updatedUser: Partial<User> = {
      phone: this.editingUser.phone,
      birthdate: this.editingUser.birthdate,
      gender: this.editingUser.gender,
      bloodType: this.editingUser.bloodType,
      emergencyContact: this.editingUser.emergencyContact,
      allergies,
      chronic: chronic
    };

    this.authService.updateCurrentUser(updatedUser).subscribe({
      next: () => {
        this.showProfileForm = false;
        this.isEditMode = false;
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
      }
    });
  }

  cancelEdit() {
    this.isEditMode = false;
    this.setupEditingUser();
  }

  private loadDashboardData() {
    if (!this.currentUser) return;
    
    this.appointmentsService.getPatientAppointments(Number(this.currentUser.id))
      .subscribe({
        next: (appointments: Appointment[]) => {
          this.upcomingAppointments = appointments
            .filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed')
            .slice(0, 3);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading appointments:', error);
          this.isLoading = false;
        }
      });
  }

  // ✅ MÉTODOS UTILITARIOS
  getDateDay(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.getDate().toString().padStart(2, '0');
    } catch {
      return '01';
    }
  }

  getDateMonth(dateString: string): string {
    try {
      const date = new Date(dateString);
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                     'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      return months[date.getMonth()] || 'ENE';
    } catch {
      return 'ENE';
    }
  }

  calculateAge(birthdate: string): number {
    try {
      const today = new Date();
      const birth = new Date(birthdate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    } catch {
      return 0;
    }
  }

  getGenderText(gender: string | undefined): string {
    switch (gender) {
      case 'M': return 'Masculino';
      case 'F': return 'Femenino';
      case 'O': return 'Otro';
      default: return 'No especificado';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'scheduled': return '#ffa500';
      case 'confirmed': return '#28a745';
      case 'completed': return '#007bff';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  }

  // ✅ MÉTODOS HELPER PARA TEMPLATE
  getUserName(): string {
    return this.currentUser?.name || 'No especificado';
  }

  getUserEmail(): string {
    return this.currentUser?.email || 'No especificado';
  }

  getUserPhone(): string {
    return this.currentUser?.phone || 'No especificado';
  }

  getUserBirthdate(): string {
    return this.currentUser?.birthdate || 'No especificado';
  }

  getUserAge(): string {
    if (this.currentUser?.birthdate) {
      return `${this.calculateAge(this.currentUser.birthdate)} años`;
    }
    return 'No especificado';
  }

  getUserBloodType(): string {
    return this.currentUser?.bloodType || 'No especificado';
  }

  getUserEmergencyContact(): string {
    return this.currentUser?.emergencyContact || 'No especificado';
  }

  getUserAllergies(): string {
    if (this.currentUser?.allergies && this.currentUser.allergies.length > 0) {
      return this.currentUser.allergies.join(', ');
    }
    return 'No registradas';
  }

  getUserChronic(): string {
    if (this.currentUser?.chronic && this.currentUser.chronic.length > 0) {
      return this.currentUser.chronic.join(', ');
    }
    return 'No registradas';
  }

  // Agregar método para iniciales del usuario
  getUserInitials(): string {
    if (!this.currentUser?.name) {
      return '';
    }
    // Toma las primeras dos iniciales de nombre y apellido
    const parts = this.currentUser.name.trim().split(/\s+/);
    const initials = parts
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    return initials;
  }
}