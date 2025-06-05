import { Component, OnInit } from '@angular/core';
import { SharedAppointmentsService, AppointmentBase } from '../../../services/shared-appointments.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-appointments-management',
  templateUrl: './appointments-management.component.html',
  styleUrls: ['./appointments-management.component.css']
})
export class AppointmentsManagementComponent implements OnInit {
  
  appointments: AppointmentBase[] = [];
  filteredAppointments: AppointmentBase[] = [];
  totalAppointments: number = 0;
  
  // Filtros
  statusFilter: string = 'all';
  dateFilter: string = '';
  searchQuery: string = '';
  
  constructor(
    private appointmentsService: SharedAppointmentsService,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    this.loadAppointments();
  }
  
  loadAppointments() {
    this.appointmentsService.getAllAppointments().subscribe(appointments => {
      this.appointments = appointments;
      this.filteredAppointments = appointments;
      this.totalAppointments = appointments.length;
      this.applyFilters();
    });
  }
  
  applyFilters() {
    let filtered = this.appointments;
    
    // Filtrar por estado
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === this.statusFilter);
    }
    
    // Filtrar por fecha
    if (this.dateFilter) {
      filtered = filtered.filter(apt => apt.date === this.dateFilter);
    }
    
    // Filtrar por búsqueda (nombre de paciente o doctor)
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(query) || 
        apt.doctorName.toLowerCase().includes(query) ||
        apt.specialty.toLowerCase().includes(query)
      );
    }
    
    this.filteredAppointments = filtered;
  }
  
  // Métodos para los filtros
  onStatusFilterChange(event: any) {
    this.statusFilter = event.target.value;
    this.applyFilters();
  }
  
  onDateFilterChange(event: any) {
    this.dateFilter = event.target.value;
    this.applyFilters();
  }
  
  onSearchChange(event: any) {
    this.searchQuery = event.target.value;
    this.applyFilters();
  }
}