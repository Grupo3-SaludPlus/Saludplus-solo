import { Component } from '@angular/core';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  title = 'Nuestros Servicios';
  services = [
    {
      title: 'Medicina General',
      description: 'Tu primera línea de atención. Evaluamos tu salud de forma integral y te orientamos en el cuidado continuo y preventivo.'
    },
    {
      title: 'Cardiología',
      description: 'Protege tu corazón con expertos. Controla hipertensión, arritmias y realiza chequeos preventivos de salud cardiovascular.'
    },
    {
      title: 'Neurología',
      description: 'Atendemos dolores de cabeza, trastornos del sueño, epilepsia y más. Cuidamos tu sistema nervioso con tecnología y experiencia.'
    },
    {
      title: 'Neurocirugía',
      description: 'Intervenciones quirúrgicas de alta precisión para tratar problemas cerebrales, columna vertebral y médula espinal.'
    },
    {
      title: 'Pediatría',
      description: 'Cuidamos a los más pequeños desde su nacimiento. Controles, vacunas y orientación para el desarrollo saludable de tu hijo.'
    },
    {
      title: 'Traumatología',
      description: '¿Dolores musculares o fracturas? Recupera tu movilidad con nuestros tratamientos efectivos y personalizados.'
    },
    {
      title: 'Kinesiología',
      description: 'Recupera tu bienestar físico con terapias de movimiento. Ideal para rehabilitación postoperatoria o lesiones deportivas.'
    },
    {
      title: 'Dermatología',
      description: 'Cuida tu piel con nuestros especialistas. Tratamos acné, manchas, alergias y más, devolviéndote seguridad y bienestar.'
    },
    {
      title: 'Oftalmología',
      description: 'Recupera tu visión y protege tu salud ocular. Realizamos controles visuales, tratamientos de cataratas y más.'
    },
    {
      title: 'Psiquiatría / Psicología',
      description: 'Tu salud mental es prioridad. Te apoyamos en procesos de ansiedad, depresión y crecimiento personal con atención confidencial y empática.'
    }
  ];
}
