import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, MedicalAppointment } from '../../../services/appointments.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-appointments.component.html',
  styleUrls: ['./doctor-appointments.component.css']
})
export class DoctorAppointmentsComponent implements OnInit, OnDestroy {
  // Variables de estado
  currentUser: any;
  appointments: MedicalAppointment[] = [];
  filteredAppointments: MedicalAppointment[] = [];
  todayAppointments: MedicalAppointment[] = [];
  selectedAppointment: MedicalAppointment | null = null;
  showAppointmentModal = false;
  
  // Variables de filtros
  viewMode: 'list' | 'calendar' = 'list';
  searchTerm = '';
  statusFilter = '';
  dateFilter = '';
  selectedDate: string | null = null;
  
  // Variables para calendario
  currentDate = new Date();
  weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  calendarDays: any[] = [];
  
  // Estadísticas
  stats = {
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    inProgress: 0
  };
  
  // Propiedades para el reagendamiento
  showRescheduleModal = false;
  newAppointmentDate: string = '';
  newAppointmentTime: string = '';

  // Agregar propiedad para almacenar temporalmente las notas
  tempNotes: string = '';

  private appointmentSubscription: Subscription | undefined;
  
  constructor(
    private authService: AuthService,
    private appointmentsService: AppointmentsService
  ) {}
  
  ngOnInit() {
    // Obtener usuario actual
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadAppointments();
      }
    });
    
    // Inicializar fecha seleccionada con la fecha actual
    this.selectedDate = new Date().toISOString().split('T')[0];
    
    // Generar días del calendario
    this.generateCalendarDays();
  }
  
  ngOnDestroy() {
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe();
    }
  }
  
  // Cargar citas médicas
  loadAppointments() {
    this.appointmentSubscription = this.appointmentsService.getAllAppointments()
      .subscribe(appointments => {
        if (this.currentUser?.id) {
          const doctorId = this.currentUser.id;
          
          // Mejorar la comparación para manejar diferentes formatos de ID
          this.appointments = appointments.filter(a => {
            // Convertir a string para comparación si es necesario
            const appointmentDoctorId = String(a.doctorId);
            const currentDoctorId = String(doctorId);
            
            return appointmentDoctorId === currentDoctorId || 
                   appointmentDoctorId === currentDoctorId.replace('doctor-', '');
          });
          
          console.log('Citas cargadas para doctor:', this.appointments);
          
          // Si no hay citas, crear algunas de prueba (solo para desarrollo)
          if (this.appointments.length === 0) {
            this.createTestAppointments();
          }
          
          this.calculateStats();
          this.loadTodayAppointments();
          this.applyFilters();
          this.updateCalendarData();
        }
      });
  }
  
  // Método para crear citas de prueba
  createTestAppointments() {
    const testAppointments = [
      {
        patientId: 1,
        patientName: "Juan Pérez",
        doctorId: this.currentUser?.id || 1,
        doctorName: "Dr. " + (this.currentUser?.name || "Test"),
        specialty: "Medicina general",
        date: new Date().toISOString().split('T')[0],
        time: "10:00",
        status: "scheduled" as "scheduled", // Tipado correcto
        reason: "Control rutinario",
        room: "101",
        notes: "",
        priority: "medium" as "low" | "medium" | "high" | "urgent"
      },
      {
        patientId: 2,
        patientName: "María González",
        doctorId: this.currentUser?.id || 1,
        doctorName: "Dr. " + (this.currentUser?.name || "Test"),
        specialty: "Medicina general",
        date: new Date().toISOString().split('T')[0],
        time: "11:30",
        status: "confirmed" as "confirmed", // Tipado correcto
        reason: "Dolor de cabeza",
        room: "102",
        notes: "",
        priority: "high" as "low" | "medium" | "high" | "urgent"
      }
    ];
    
    testAppointments.forEach(appt => {
      this.appointmentsService.createAppointment(appt);
    });
    
    // Recargar después de crear las citas
    setTimeout(() => this.loadAppointments(), 500);
  }
  
  // Cargar citas de hoy
  loadTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    this.todayAppointments = this.appointments
      .filter(a =>
        a.date === today &&
        a.doctorId === this.currentUser?.id &&
        (a.status === 'scheduled' || a.status === 'confirmed')
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  }
  
  // Calcular estadísticas
  calculateStats() {
    // Reiniciar estadísticas
    this.stats = {
      total: this.appointments.length,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      inProgress: 0
    };
    
    // Contar por estado
    this.appointments.forEach(a => {
      if (a.status === 'scheduled' || a.status === 'confirmed') {
        this.stats.scheduled++;
      } else if (a.status === 'completed') {
        this.stats.completed++;
      } else if (a.status === 'cancelled') {
        this.stats.cancelled++;
      } else if (a.status === 'in-progress') {
        this.stats.inProgress++;
      }
    });
  }
  
  // Aplicar filtros a las citas
  applyFilters() {
    let filtered = [...this.appointments];
    
    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.patientName?.toLowerCase().includes(term) || 
        a.reason?.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por estado
    if (this.statusFilter) {
      filtered = filtered.filter(a => a.status === this.statusFilter);
    }
    
    // Filtrar por fecha
    if (this.dateFilter) {
      filtered = filtered.filter(a => a.date === this.dateFilter);
    } else if (this.selectedDate && this.viewMode === 'calendar') {
      filtered = filtered.filter(a => a.date === this.selectedDate);
    }
    
    this.filteredAppointments = filtered;
  }
  
  // Manejar cambio en búsqueda
  onSearchChange() {
    this.applyFilters();
  }
  
  // Manejar cambio en filtro de estado
  onStatusFilterChange() {
    this.applyFilters();
  }
  
  // Manejar cambio en filtro de fecha
  onDateFilterChange() {
    // Si hay filtro de fecha, actualizar la fecha seleccionada en el calendario
    if (this.dateFilter) {
      this.selectedDate = this.dateFilter;
      
      // Actualizar el mes actual del calendario si es necesario
      const filterDate = new Date(this.dateFilter);
      if (filterDate.getMonth() !== this.currentDate.getMonth() || 
          filterDate.getFullYear() !== this.currentDate.getFullYear()) {
        this.currentDate = new Date(filterDate);
        this.generateCalendarDays();
      }
    }
    
    this.applyFilters();
  }
  
  // Restablecer todos los filtros
  resetFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.dateFilter = '';
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.currentDate = new Date();
    this.generateCalendarDays();
    this.applyFilters();
  }
  
  // Generar días para el calendario
  generateCalendarDays() {
    this.calendarDays = [];
    
    // Obtener primer día del mes
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    
    // Días del mes anterior para completar la primera semana
    const daysFromPrevMonth = firstDay.getDay();
    const prevLastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0).getDate();
    
    for (let i = prevLastDay - daysFromPrevMonth + 1; i <= prevLastDay; i++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, i);
      this.calendarDays.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        date: date,
        hasAppointments: false,
        appointments: 0
      });
    }
    
    // Días del mes actual
    const today = new Date();
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);
      const dateStr = date.toISOString().split('T')[0];
      const appointmentsForDay = this.appointments.filter(a => a.date === dateStr);
      
      this.calendarDays.push({
        day: i,
        isCurrentMonth: true,
        isToday: i === today.getDate() && 
                 this.currentDate.getMonth() === today.getMonth() && 
                 this.currentDate.getFullYear() === today.getFullYear(),
        date: date,
        hasAppointments: appointmentsForDay.length > 0,
        appointments: appointmentsForDay.length
      });
    }
    
    // Días del próximo mes para completar la última semana
    const daysFromNextMonth = 42 - this.calendarDays.length;
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, i);
      this.calendarDays.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        date: date,
        hasAppointments: false,
        appointments: 0
      });
    }
  }
  
  // Actualizar datos del calendario
  updateCalendarData() {
    // Actualizar indicadores de citas en los días del calendario
    this.calendarDays.forEach(day => {
      const dateStr = day.date.toISOString().split('T')[0];
      const appointmentsForDay = this.appointments.filter(a => a.date === dateStr);
      day.hasAppointments = appointmentsForDay.length > 0;
      day.appointments = appointmentsForDay.length;
    });
  }
  
  // Seleccionar una fecha en el calendario
  selectDate(date: Date) {
    this.selectedDate = date.toISOString().split('T')[0];
    this.dateFilter = this.selectedDate;
    this.applyFilters();
  }
  
  // Seleccionar hoy en el calendario
  selectToday() {
    const today = new Date();
    if (today.getMonth() !== this.currentDate.getMonth() || 
        today.getFullYear() !== this.currentDate.getFullYear()) {
      this.currentDate = today;
      this.generateCalendarDays();
    }
    this.selectedDate = today.toISOString().split('T')[0];
    this.dateFilter = this.selectedDate;
    this.applyFilters();
  }
  
  // Cambiar al mes anterior
  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendarDays();
    this.updateCalendarData();
  }
  
  // Cambiar al mes siguiente
  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendarDays();
    this.updateCalendarData();
  }
  
  // Obtener el nombre del mes actual
  getCurrentMonth(): string {
    return this.currentDate.toLocaleString('default', { month: 'long' });
  }
  
  // Obtener el año actual
  getCurrentYear(): number {
    return this.currentDate.getFullYear();
  }
  
  // Ver detalles de una cita
  viewAppointmentDetails(appointment: MedicalAppointment) {
    this.selectedAppointment = { ...appointment };
    this.showAppointmentModal = true;
  }
  
  // Cerrar modal de detalles
  closeAppointmentModal() {
    this.showAppointmentModal = false;
    this.selectedAppointment = null;
  }
  
  // Iniciar una consulta médica
  startAppointment(appointment: MedicalAppointment) {
    this.appointmentsService.updateAppointmentStatus(appointment.id, 'in-progress');
    
    // Si estamos en el modal, actualizar el estado del appointment seleccionado
    if (this.selectedAppointment && this.selectedAppointment.id === appointment.id) {
      this.selectedAppointment.status = 'in-progress';
    }
  }
  
  // Completar una consulta médica
  completeAppointment(appointment: MedicalAppointment) {
    this.appointmentsService.updateAppointmentStatus(appointment.id, 'completed');
    
    // Si estamos en el modal, actualizar el estado del appointment seleccionado
    if (this.selectedAppointment && this.selectedAppointment.id === appointment.id) {
      this.selectedAppointment.status = 'completed';
    }
  }
  
  // Cancelar una consulta médica
  cancelAppointment(appointment: MedicalAppointment) {
    if (confirm('¿Está seguro de cancelar esta cita?')) {
      this.appointmentsService.updateAppointmentStatus(appointment.id, 'cancelled');
      
      // Si estamos en el modal, actualizar el estado del appointment seleccionado
      if (this.selectedAppointment && this.selectedAppointment.id === appointment.id) {
        this.selectedAppointment.status = 'cancelled';
      }
    }
  }
  
  // Método para mostrar notificaciones
  showNotification(message: string, type: 'success' | 'error' | 'info' = 'success') {
    // Implementación simple con console.log
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Si tienes un servicio de notificaciones, úsalo así:
    // this.notificationService.show(message, type);
    
    // Alternativa: muestra una notificación nativa del navegador
    if (Notification.permission === 'granted') {
      new Notification('SaludPlus', {
        body: message,
        icon: '/assets/images/logo.png'
      });
    }
  }

  // Reagendar una cita
  rescheduleAppointment(appointment: MedicalAppointment) {
    this.selectedAppointment = appointment;
    
    // Establecer los valores iniciales para la fecha y hora
    this.newAppointmentDate = new Date().toISOString().split('T')[0]; // Fecha actual como valor inicial
    this.newAppointmentTime = '10:00'; // Hora predeterminada
    
    this.showRescheduleModal = true;
  }
  
  // Guardar cita reagendada
  saveRescheduledAppointment() {
    if (this.selectedAppointment && this.newAppointmentDate && this.newAppointmentTime) {
      const updatedAppointment = {
        id: this.selectedAppointment.id,
        date: this.newAppointmentDate,
        time: this.newAppointmentTime,
        status: "rescheduled" as "rescheduled" // Tipado correcto
      };
      
      this.appointmentsService.updateAppointment(updatedAppointment);
      
      // Actualizar UI
      this.showRescheduleModal = false;
      this.showNotification('Cita reagendada correctamente');
      
      // Limpiar los campos
      this.newAppointmentDate = '';
      this.newAppointmentTime = '';
    }
  }
  
  // Confirmar una cita
  confirmAppointment(appointment: MedicalAppointment) {
    if (appointment && appointment.id) {
      const updatedAppointment = {
        id: appointment.id,
        status: 'confirmed' as 'confirmed'
      };
      
      this.appointmentsService.updateAppointment(updatedAppointment);
      
      // Si estamos viendo este appointment, actualizar la UI
      if (this.selectedAppointment && this.selectedAppointment.id === appointment.id) {
        this.selectedAppointment.status = 'confirmed';
      }
      
      this.showNotification('Cita confirmada correctamente');
      
      // Recargar datos para actualizar las estadísticas
      setTimeout(() => this.calculateStats(), 500);
    }
  }
  
  // Método para guardar las notas actualizadas
  saveNotes() {
    if (this.selectedAppointment && this.selectedAppointment.id) {
      // Crear objeto con las actualizaciones
      const updatedAppointment = {
        id: this.selectedAppointment.id,
        notes: this.selectedAppointment.notes
      };
      
      // Guardar los cambios
      this.appointmentsService.updateAppointment(updatedAppointment);
      
      // Mostrar confirmación
      this.showNotification('Notas guardadas correctamente');
      
      // Actualizar en la lista local
      const index = this.appointments.findIndex(a => a.id === this.selectedAppointment?.id);
      if (index >= 0) {
        this.appointments[index].notes = this.selectedAppointment.notes;
        
        // Actualizar listas filtradas
        this.applyFilters();
        this.loadTodayAppointments();
      }
    }
  }
  
  // Método para iniciar la edición de notas
  editNotes() {
    if (this.selectedAppointment) {
      // Guardar notas actuales por si se cancela la edición
      this.tempNotes = this.selectedAppointment.notes || '';
    }
  }
  
  // Método para cancelar la edición de notas
  cancelEditNotes() {
    if (this.selectedAppointment) {
      // Restaurar notas anteriores
      this.selectedAppointment.notes = this.tempNotes;
    }
  }
  
  // Verificar si una cita puede iniciarse (solo si está agendada o confirmada)
  canStart(appointment: MedicalAppointment): boolean {
    return appointment.status === 'scheduled' || appointment.status === 'confirmed';
  }
  
  // Verificar si una cita puede completarse (solo si está in progreso)
  canComplete(appointment: MedicalAppointment): boolean {
    return appointment.status === 'in-progress';
  }
  
  // Verificar si una cita puede cancelarse
  canCancel(appointment: MedicalAppointment): boolean {
    return appointment.status === 'scheduled' || appointment.status === 'confirmed' || 
           appointment.status === 'in-progress';
  }
  
  // Verificar si una cita puede ser confirmada (solo pendientes o programadas)
  canConfirm(appointment: MedicalAppointment | null): boolean {
    if (!appointment) return false;
    return appointment.status === 'scheduled';
  }
  
  // Verificar si una cita puede ser reagendada
  canReschedule(appointment: MedicalAppointment | null): boolean {
    if (!appointment) return false;
    return ['scheduled', 'confirmed'].includes(appointment.status);
  }
  
  // Formatear fecha
  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Obtener clase de prioridad
  getPriorityClass(priority: string | undefined): string {
    if (!priority) return 'priority-medium';
    return `priority-${priority}`;
  }
  
  // Obtener texto de prioridad
  getPriorityText(priority: string | undefined): string {
    if (!priority) return 'Media';
    
    switch(priority) {
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return priority;
    }
  }
  
  // Obtener texto de estado
  getStatusText(status: string | undefined): string {
    if (!status) return 'Agendada';
    
    switch(status) {
      case 'scheduled': return 'Agendada';
      case 'confirmed': return 'Confirmada';
      case 'in-progress': return 'En curso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'rescheduled': return 'Reagendada';
      case 'emergency': return 'Emergencia';
      default: return status;
    }
  }
  
  // Obtener clase CSS para el estado
  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-scheduled';
    
    switch(status) {
      case 'scheduled': return 'status-scheduled';
      case 'confirmed': return 'status-confirmed';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'rescheduled': return 'status-rescheduled';
      case 'emergency': return 'status-emergency';
      default: return `status-${status}`;
    }
  }
}