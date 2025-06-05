import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class DoctorsComponent {
  title = 'Nuestros Médicos';
  subtitle = 'Contamos con un equipo de profesionales altamente calificados';
  
  doctors = [
    {
      name: 'Dra. Carla Mendoza',
      specialty: 'Cardiología',
      education: 'Universidad de Chile',
      experience: '12 años de experiencia',
      availability: 'Lunes a Jueves 9:00 - 17:00'
    },
    {
      name: 'Dr. Roberto Fuentes',
      specialty: 'Neurología',
      education: 'Universidad Católica',
      experience: '8 años de experiencia',
      availability: 'Martes y Viernes 8:00 - 14:00'
    },
    {
      name: 'Dra. Valentina Torres',
      specialty: 'Pediatría',
      education: 'Universidad de Concepción',
      experience: '15 años de experiencia',
      availability: 'Lunes, Miércoles y Viernes 10:00 - 18:00'
    },
    {
      name: 'Dr. Andrés Soto',
      specialty: 'Traumatología',
      education: 'Universidad de Santiago',
      experience: '10 años de experiencia',
      availability: 'Miércoles y Jueves 14:00 - 20:00'
    }
  ];
}
