import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { AppointmentsService } from '../../../services/appointments.service';
import { User, Appointment } from '../../../services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css']
})
export class DoctorAppointmentsComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];
  selectedAppointment: Appointment | null = null;
  currentDoctor: User | null = null;
  
  // ✅ AGREGAR TODAS LAS PROPIEDADES QUE FALTAN
  // Estadísticas
  stats = {
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0
  };
  
  // Filtros
  statusFilter: string = 'all';
  dateFilter: string = '';
  searchTerm: string = '';
  
  // Estados del modal
  showModal: boolean = false;
  showRescheduleModal: boolean = false;
  showAppointmentModal: boolean = false;
  
  // ✅ AGREGAR PROPIEDADES QUE FALTABAN
  newAppointmentDate: string = '';
  newAppointmentTime: string = '';
  rescheduleDate: string = '';
  rescheduleTime: string = '';
  
  // Vista y calendario
  viewMode: 'list' | 'calendar' = 'list';
  selectedDate: string = '';
  calendarDays: any[] = [];
  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  currentCalendarDate: Date = new Date();
  
  // Estadísticas de hoy
  todayTotal: number = 0;
  todayCompleted: number = 0;
  todayPending: number = 0;
  todayCancelled: number = 0;
  
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private appointmentsService: AppointmentsService // ✅ CORREGIR NOMBRE
  ) {
    this.generateCalendarDays();
  }

  ngOnInit() {
    this.subscription.add(
      this.authService.currentUser$.subscribe((user: User | null) => {
        if (user) {
          this.currentDoctor = user;
          this.loadDoctorAppointments();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private loadDoctorAppointments() {
    this.subscription.add(
      this.appointmentsService.getAllAppointments().subscribe((appointments: Appointment[]) => {
        this.appointments = appointments
          .filter((apt: Appointment) => apt.doctor_name === this.currentDoctor?.name)
          .map(apt => ({
            ...apt,
            patientName: apt.patient_name,
            doctorName: apt.doctor_name,
            notes: apt.notes,
            priority: apt.priority,
            // ELIMINAR estas líneas porque los campos no existen:
            // patientAge: apt.patient_age,
            // endTime: apt.end_time,
            // room: apt.room,
          }));
      
        this.applyFilters();
        this.calculateStats();
        this.calculateTodayStats();
      })
    );
  }

  private calculateStats() {
    this.stats.total = this.appointments.length;
    this.stats.scheduled = this.appointments.filter(apt => apt.status === 'scheduled').length;
    this.stats.completed = this.appointments.filter(apt => apt.status === 'completed').length;
    this.stats.cancelled = this.appointments.filter(apt => apt.status === 'cancelled').length;
  }

  private calculateTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    this.todayAppointments = this.appointments.filter(apt => apt.date === today);
    
    this.todayTotal = this.todayAppointments.length;
    this.todayCompleted = this.todayAppointments.filter(apt => apt.status === 'completed').length;
    this.todayPending = this.todayAppointments.filter(apt => 
      apt.status === 'scheduled' || apt.status === 'confirmed'
    ).length;
    this.todayCancelled = this.todayAppointments.filter(apt => apt.status === 'cancelled').length;
  }

  // Métodos de filtrado
  applyFilters() {
    let filtered = [...this.appointments];

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === this.statusFilter);
    }

    if (this.dateFilter) {
      filtered = filtered.filter(apt => apt.date === this.dateFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patient_name.toLowerCase().includes(term.toLowerCase()) ||
        apt.reason.toLowerCase().includes(term.toLowerCase())
      );
    }

    this.filteredAppointments = filtered;
  }

  onFilterChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onDateFilterChange() {
    this.applyFilters();
  }

  resetFilters() {
    this.statusFilter = 'all';
    this.dateFilter = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  // ✅ AGREGAR MÉTODOS QUE FALTABAN
  saveNotes() {
    this.saveAppointmentNotes();
  }

  saveRescheduledAppointment() {
    if (this.selectedAppointment) {
      this.rescheduleAppointment(this.selectedAppointment);
    }
  }

  // Métodos de calendario
  generateCalendarDays() {
    const year = this.currentCalendarDate.getFullYear();
    const month = this.currentCalendarDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    this.calendarDays = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      this.calendarDays.push({
        date: date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: this.isToday(date),
        hasAppointments: this.hasAppointmentsOnDate(date)
      });
    }
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  private hasAppointmentsOnDate(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return this.appointments.some(apt => apt.date === dateStr);
  }

  prevMonth() {
    this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
    this.generateCalendarDays();
  }

  nextMonth() {
    this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
    this.generateCalendarDays();
  }

  getCurrentMonth(): string {
    return this.currentCalendarDate.toLocaleDateString('es-ES', { month: 'long' });
  }

  getCurrentYear(): number {
    return this.currentCalendarDate.getFullYear();
  }

  selectToday() {
    this.currentCalendarDate = new Date();
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.generateCalendarDays();
  }

  selectDate(date: Date) {
    this.selectedDate = date.toISOString().split('T')[0];
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Métodos de modal
  viewAppointmentDetails(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.showModal = true;
    this.showAppointmentModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedAppointment = null;
  }

  closeAppointmentModal() {
    this.showAppointmentModal = false;
    this.selectedAppointment = null;
  }

  // Métodos de citas
  startAppointment(appointment: Appointment) {
    this.appointmentsService.updateAppointment(appointment.id, { 
      status: 'in-progress' 
    }).subscribe(() => {
      this.loadDoctorAppointments();
    });
  }

  completeAppointment(appointment: Appointment) {
    this.appointmentsService.updateAppointment(appointment.id, { 
      status: 'completed' 
    }).subscribe(() => {
      this.loadDoctorAppointments();
      this.closeModal();
    });
  }

  cancelAppointment(appointment: Appointment) {
    if (confirm('¿Está seguro de que desea cancelar esta cita?')) {
      this.appointmentsService.updateAppointment(appointment.id, { 
        status: 'cancelled' 
      }).subscribe(() => {
        this.loadDoctorAppointments();
        this.closeModal();
      });
    }
  }

  confirmAppointment(appointment: Appointment) {
    this.appointmentsService.updateAppointment(appointment.id, { 
      status: 'confirmed' 
    }).subscribe(() => {
      this.loadDoctorAppointments();
    });
  }

  rescheduleAppointment(appointment: Appointment) {
    if (!this.newAppointmentDate || !this.newAppointmentTime) {
      alert('Por favor seleccione fecha y hora');
      return;
    }

    this.appointmentsService.updateAppointment(appointment.id, {
      date: this.newAppointmentDate,
      time: this.newAppointmentTime,
      status: 'scheduled'
    }).subscribe(() => {
      this.loadDoctorAppointments();
      this.closeRescheduleModal();
      this.closeModal();
    });
  }

  openRescheduleModal() {
    this.showRescheduleModal = true;
    if (this.selectedAppointment) {
      this.rescheduleDate = this.selectedAppointment.date;
      this.rescheduleTime = this.selectedAppointment.time;
      this.newAppointmentDate = this.selectedAppointment.date;
      this.newAppointmentTime = this.selectedAppointment.time;
    }
  }

  closeRescheduleModal() {
    this.showRescheduleModal = false;
    this.rescheduleDate = '';
    this.rescheduleTime = '';
    this.newAppointmentDate = '';
    this.newAppointmentTime = '';
  }

  saveAppointmentNotes() {
    if (!this.selectedAppointment) return;

    this.appointmentsService.updateAppointment(this.selectedAppointment.id, {
      notes: this.selectedAppointment.notes || ''
    }).subscribe(() => {
      const index = this.appointments.findIndex(apt => apt.id === this.selectedAppointment?.id);
      if (index !== -1) {
        this.appointments[index] = { ...this.appointments[index], notes: this.selectedAppointment?.notes };
      }
      this.applyFilters();
    });
  }

  // Métodos de estado
  canStart(appointment: Appointment): boolean {
    return appointment.status === 'confirmed' || appointment.status === 'scheduled';
  }

  canComplete(appointment: Appointment): boolean {
    return appointment.status === 'in-progress' || appointment.status === 'confirmed';
  }

  canCancel(appointment: Appointment): boolean {
    return appointment.status !== 'completed' && appointment.status !== 'cancelled';
  }

  canConfirm(appointment: Appointment | null): boolean {
    return appointment?.status === 'scheduled';
  }

  canReschedule(appointment: Appointment | null): boolean {
    return appointment?.status === 'scheduled' || appointment?.status === 'confirmed';
  }

  // Métodos de estilo
  getStatusColor(status: string): string {
    switch (status) {
      case 'scheduled': return '#ffa500';
      case 'confirmed': return '#28a745';
      case 'in-progress': return '#007bff';
      case 'completed': return '#6f42c1';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
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

  getStatusClass(status: string): string {
    return `status-${status}`;
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

  // ✅ AGREGAR MÉTODO QUE FALTABA
  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }
}