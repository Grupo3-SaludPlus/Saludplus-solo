import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroComponent } from '../../components/hero/hero.component';
import { ServicesComponent } from '../../components/services/services.component';
import { AboutUsComponent } from '../../components/about-us/about-us.component';
import { InsuranceComponent } from '../../components/insurance/insurance.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroComponent, ServicesComponent, AboutUsComponent, InsuranceComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  // Este componente ahora tiene una estructura más modular y organizada
  // Cada sección está en su propio componente con sus propios estilos y lógica
}
