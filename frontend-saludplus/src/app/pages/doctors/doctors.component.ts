import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorsService, Doctor } from '../../services/doctors.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent implements OnInit {
  title = 'Nuestros Médicos Especialistas';
  subtitle = 'Encuentra al profesional de la salud que necesitas';
  
  searchTerm: string = '';
  selectedSpecialty: string = '';
  
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  specialties: string[] = [];

  constructor(
    private router: Router,
    private doctorsService: DoctorsService
  ) {}

  ngOnInit() {
    // Suscribirse a cambios en la lista de médicos
    this.doctorsService.getDoctors().subscribe(doctors => {
      this.doctors = doctors;
      this.filteredDoctors = [...this.doctors];
      this.specialties = [...new Set(this.doctors.map(doctor => doctor.specialty))];
    });
  }

  onSearchChange() {
    this.filterDoctors();
  }

  onSpecialtyChange() {
    this.filterDoctors();
  }

  filterDoctors() {
    this.filteredDoctors = this.doctors.filter(doctor => {
      const matchesSearch = !this.searchTerm || 
        doctor.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesSpecialty = !this.selectedSpecialty || 
        doctor.specialty === this.selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedSpecialty = '';
    this.filteredDoctors = [...this.doctors];
  }

  // Método actualizado para manejar ratings undefined
  getStars(rating: number | undefined): number[] {
    if (rating === undefined) {
      return Array(5).fill(0);
    }
    // Asegurar que el rating sea un número entre 0 y 5
    const safeRating = Math.min(5, Math.max(0, rating));
    // Redondear a 0.5 más cercano
    const roundedRating = Math.round(safeRating * 2) / 2;
    return Array(5).fill(0).map((_, index) => {
      if (index + 0.5 < roundedRating) {
        return 1; // estrella completa
      } else if (index < roundedRating) {
        return 0.5; // media estrella
      } else {
        return 0; // sin estrella
      }
    });
  }

  // AGREGAR: Método para ver perfil del médico
  viewDoctorProfile(doctorId: number) {
    // Por ahora mostrar alerta, luego implementar ruta al perfil
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (doctor) {
      alert(`Ver perfil de ${doctor.name}\n\nEsta funcionalidad se implementará próximamente.\n\nInformación:\n- Especialidad: ${doctor.specialty}\n- Email: ${doctor.email}\n- Teléfono: ${doctor.phoneNumber}`);
    }
  }

  // AGREGAR: Método para agendar cita
  scheduleAppointment(doctorId: number) {
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (doctor) {
      // Navegar a la página de agendar cita con el médico seleccionado
      this.router.navigate(['/appointments'], { 
        queryParams: { 
          doctorId: doctorId,
          doctorName: doctor.name,
          specialty: doctor.specialty 
        } 
      });
    }
  }
}
