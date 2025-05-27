import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuOpen = false;

  navItems = [
    { path: '/', label: 'Inicio' },
    { path: '/doctors', label: 'Nuestros Médicos' },
    { path: '/appointments', label: 'Agenda' },
    { path: '/register', label: 'Registro' }
  ];

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
