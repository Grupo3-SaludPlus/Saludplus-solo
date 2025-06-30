import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';
import { SharedAppointmentsService, AppointmentBase } from '../../../services/shared-appointments.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  editingUser: Partial<User> = {};
  appointments: AppointmentBase[] = [];
  upcomingAppointments: AppointmentBase[] = [];
  isEditMode = false;
  allergiesText = '';
  chronicText = '';
  showProfileForm = false;
  
  // Estadísticas calculadas
  totalAppointments = 0;
  completedAppointments = 0;
  pendingAppointments = 0;
  cancelledAppointments = 0;
  
  private userSubscription?: Subscription;
  private appointmentsSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private appointmentsService: SharedAppointmentsService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (user) {
        this.loadUserAppointments();
        this.setupEditingUser();
      }
    });

    // Cargar todas las citas para estadísticas
    this.appointmentsSubscription = this.appointmentsService.getAllAppointments()
      .subscribe((appointments: AppointmentBase[]) => {
        this.upcomingAppointments = appointments.filter(apt => 
          apt.patientName === this.currentUser?.name &&
          (apt.status === 'scheduled' || apt.status === 'confirmed')
        );
        this.calculateStatistics();
      });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.appointmentsSubscription?.unsubscribe();
  }

  private loadUserAppointments() {
    if (!this.currentUser) return;

    this.appointmentsService.getAllAppointments().subscribe((allAppointments: AppointmentBase[]) => {
      this.appointments = allAppointments.filter((apt: AppointmentBase) => 
        apt.patientName === this.currentUser?.name
      );
      this.calculateStatistics();
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
      this.editingUser = { 
        ...this.currentUser,
        phone: this.currentUser.phone || '',
        birthdate: this.currentUser.birthdate || '',
        gender: this.currentUser.gender || 'O',
        bloodType: this.currentUser.bloodType || '',
        emergencyContact: this.currentUser.emergencyContact || ''
      };
      
      this.allergiesText = this.currentUser.allergies?.join(', ') || '';
      this.chronicText = this.currentUser.chronic?.join(', ') || '';
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
    if (!this.currentUser || !this.editingUser) return;

    const allergies = this.allergiesText.split(',').map(a => a.trim()).filter(a => a);
    const chronic = this.chronicText.split(',').map(c => c.trim()).filter(c => c);

    const updatedUser: Partial<User> = {
      ...this.editingUser,
      allergies,
      chronic: chronic
    };

    this.authService.updateCurrentUser(updatedUser);
    this.showProfileForm = false;
    this.isEditMode = false;
  }

  cancelEdit() {
    this.isEditMode = false;
    this.setupEditingUser();
  }

  // Funciones utilitarias para fechas
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

  calculateAge(birthdate?: string): number | null {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  getGenderText(gender?: string): string {
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
}