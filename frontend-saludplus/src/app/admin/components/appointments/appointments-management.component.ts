import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointments-management',
  templateUrl: './appointments-management.component.html',
  styleUrls: ['./appointments-management.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class AppointmentsManagementComponent implements OnInit {
  // Propiedades de UI
  currentView: 'list' | 'detail' | 'create' | 'edit' = 'list';
  selectedAppointment: any = null;
  
  // Búsqueda y filtros
  searchTerm: string = '';
  statusFilter: string = 'all';
  dateFilter: string = '';
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  
  // Datos
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  patients: any[] = [];
  doctors: any[] = [];
  specialties: any[] = [];
  
  // Estado UI
  isLoading: boolean = false;
  
  // Formulario
  appointmentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      specialtyId: ['', Validators.required],
      doctorId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      status: ['scheduled', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.loadPatients();
    this.loadDoctors();
    this.loadSpecialties();
  }

  // Carga de datos (mock)
  loadAppointments(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.appointments = this.generateMockAppointments();
      this.filteredAppointments = [...this.appointments];
      this.totalItems = this.appointments.length;
      this.isLoading = false;
    }, 500);
  }
  
  loadPatients(): void {
    this.patients = [
      { id: 'p1', name: 'Juan Pérez' },
      { id: 'p2', name: 'María González' },
      { id: 'p3', name: 'Carlos Rodríguez' }
    ];
  }
  
  loadDoctors(): void {
    this.doctors = [
      { id: 'd1', name: 'Dr. Alejandro Soto', specialtyName: 'Cardiología', specialtyId: 's1' },
      { id: 'd2', name: 'Dra. Carmen Vega', specialtyName: 'Dermatología', specialtyId: 's2' },
      { id: 'd3', name: 'Dr. Roberto Núñez', specialtyName: 'Pediatría', specialtyId: 's3' }
    ];
  }
  
  loadSpecialties(): void {
    this.specialties = [
      { id: 's1', name: 'Cardiología' },
      { id: 's2', name: 'Dermatología' },
      { id: 's3', name: 'Pediatría' }
    ];
  }

  // Métodos de búsqueda y filtros
  onSearch(): void {
    this.applyFilters();
  }
  
  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }
  
  onDateFilterChange(): void {
    this.applyFilters();
  }
  
  applyFilters(): void {
    let filtered = [...this.appointments];
    
    // Filtrar por término de búsqueda
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(term) ||
        apt.doctorName.toLowerCase().includes(term) ||
        apt.id.toString().toLowerCase().includes(term)
      );
    }
    
    // Filtrar por estado
    if (this.statusFilter && this.statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === this.statusFilter);
    }
    
    // Filtrar por fecha
    if (this.dateFilter && this.dateFilter.trim() !== '') {
      filtered = filtered.filter(apt => apt.date === this.dateFilter);
    }
    
    this.filteredAppointments = filtered;
    this.totalItems = this.filteredAppointments.length;
    this.currentPage = 1;
  }
  
  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.dateFilter = '';
    this.applyFilters();
  }

  // Paginación
  changePage(page: number): void {
    this.currentPage = page;
  }

  // Acciones para citas
  createNewAppointment(): void {
    this.currentView = 'create';
    this.appointmentForm.reset({
      patientId: '',
      specialtyId: '',
      doctorId: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      status: 'scheduled',
      notes: ''
    });
  }
  
  viewAppointmentDetails(appointment: any): void {
    this.selectedAppointment = appointment;
    this.currentView = 'detail';
  }
  
  editAppointment(appointment: any): void {
    this.selectedAppointment = appointment;
    this.currentView = 'edit';
    this.appointmentForm.patchValue({
      patientId: appointment.patientId,
      specialtyId: appointment.specialtyId,
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes || ''
    });
  }
  
  cancelAppointment(appointment: any): void {
    if (confirm(`¿Está seguro que desea cancelar esta cita?`)) {
      appointment.status = 'cancelled';
      this.applyFilters();
    }
  }
  
  deleteAppointment(appointment: any): void {
    if (confirm(`¿Está seguro que desea eliminar esta cita? Esta acción no se puede deshacer.`)) {
      this.appointments = this.appointments.filter(a => a.id !== appointment.id);
      this.applyFilters();
      
      if (this.currentView === 'detail') {
        this.currentView = 'list';
      }
    }
  }
  
  cancelForm(): void {
    this.currentView = 'list';
  }
  
  submitAppointmentForm(): void {
    if (this.appointmentForm.invalid) return;
    
    const values = this.appointmentForm.value;
    const patient = this.patients.find(p => p.id === values.patientId);
    const doctor = this.doctors.find(d => d.id === values.doctorId);
    const specialty = this.specialties.find(s => s.id === values.specialtyId);
    
    const appointmentData = {
      ...values,
      patientName: patient?.name || '',
      doctorName: doctor?.name || '',
      specialtyName: specialty?.name || '',
      updatedAt: new Date().toISOString()
    };
    
    if (this.currentView === 'create') {
      // Crear nueva cita
      const newAppointment = {
        id: `app-${Date.now()}`,
        ...appointmentData,
        createdAt: new Date().toISOString()
      };
      
      this.appointments.push(newAppointment);
    } else if (this.currentView === 'edit') {
      // Actualizar cita existente
      const index = this.appointments.findIndex(a => a.id === this.selectedAppointment.id);
      if (index !== -1) {
        this.appointments[index] = {
          ...this.selectedAppointment,
          ...appointmentData
        };
      }
    }
    
    this.applyFilters();
    this.currentView = 'list';
  }
  
  // Utilidades
  formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  getStatusBadgeClass(status: string): string {
    const classes: {[key: string]: string} = {
      'scheduled': 'badge-scheduled',
      'completed': 'badge-completed',
      'cancelled': 'badge-cancelled',
      'pending': 'badge-pending'
    };
    return classes[status] || '';
  }
  
  getStatusText(status: string): string {
    const texts: {[key: string]: string} = {
      'scheduled': 'Programada',
      'completed': 'Completada',
      'cancelled': 'Cancelada',
      'pending': 'Pendiente'
    };
    return texts[status] || status;
  }
  
  // Datos mock para pruebas
  private generateMockAppointments(): any[] {
    return [
      {
        id: 'app-001',
        patientId: 'p1',
        patientName: 'Juan Pérez',
        doctorId: 'd1',
        doctorName: 'Dr. Alejandro Soto',
        specialtyId: 's1',
        specialtyName: 'Cardiología',
        date: '2025-06-15',
        time: '09:00',
        status: 'scheduled',
        notes: 'Control cardíaco rutinario',
        createdAt: '2025-06-01',
        updatedAt: '2025-06-01'
      },
      {
        id: 'app-002',
        patientId: 'p2',
        patientName: 'María González',
        doctorId: 'd2',
        doctorName: 'Dra. Carmen Vega',
        specialtyId: 's2',
        specialtyName: 'Dermatología',
        date: '2025-06-16',
        time: '10:30',
        status: 'completed',
        notes: 'Revisión de alergia cutánea',
        createdAt: '2025-06-02',
        updatedAt: '2025-06-16'
      },
      {
        id: 'app-003',
        patientId: 'p3',
        patientName: 'Carlos Rodríguez',
        doctorId: 'd3',
        doctorName: 'Dr. Roberto Núñez',
        specialtyId: 's3',
        specialtyName: 'Pediatría',
        date: '2025-06-20',
        time: '15:00',
        status: 'cancelled',
        notes: 'Control de rutina - Cancelado por el paciente',
        createdAt: '2025-06-05',
        updatedAt: '2025-06-12'
      }
    ];
  }
}