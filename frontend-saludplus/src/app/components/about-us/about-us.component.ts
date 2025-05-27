import { Component } from '@angular/core';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {
  title = '¿Quiénes Somos?';
  content = `En <strong>SaludPlus</strong>, somos un centro médico comprometido con el bienestar físico y emocional de nuestros pacientes. 
    Con más de 10 años de experiencia, ofrecemos atención de calidad, oportuna y humana, en un ambiente moderno y seguro. 
    Nuestro equipo de profesionales está altamente capacitado para acompañarte en cada etapa de tu salud, con tecnología de vanguardia y un enfoque integral.`;
}
