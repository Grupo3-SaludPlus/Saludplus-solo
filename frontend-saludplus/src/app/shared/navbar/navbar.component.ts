import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  showUserMenu = false;
  currentUser: User | null = null;
  
  navItems = [
    { path: '/', label: 'Inicio' },
    { path: '/doctors', label: 'Nuestros Médicos' },
    { path: '/appointments', label: 'Agenda' },
    { path: '/account', label: 'Mi Cuenta' }
  ];

  constructor(
    private authService: AuthService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    // Suscripción al usuario actual
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  // Añade método para alternar menú principal
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Añade método para alternar menú de usuario
  toggleUserMenu(event: Event) {
    event.stopPropagation(); // Prevenir que se propague al document
    this.showUserMenu = !this.showUserMenu;
  }

  // Mostrar nombre legible del rol
  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'doctor': return 'Médico';
      case 'patient': return 'Paciente';
      default: return role;
    }
  }

  // Cerrar sesión
  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }

  // Cerrar menú cuando se hace clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Verificar si el clic fue fuera del menú de usuario
    const userMenuElement = this.elementRef.nativeElement.querySelector('.user-menu');
    if (userMenuElement && !userMenuElement.contains(event.target as Node) && this.showUserMenu) {
      this.showUserMenu = false;
    }
  }
}
