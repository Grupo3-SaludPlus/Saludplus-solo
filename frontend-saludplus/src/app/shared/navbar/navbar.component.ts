import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  showUserMenu = false;
  showLogoutPopup = false;

  navItems = [
    { path: '/patient/dashboard', label: 'Dashboard', roles: ['patient'] },
    { path: '/doctor/dashboard', label: 'Dashboard', roles: ['doctor'] },
    { path: '/admin/dashboard', label: 'Dashboard', roles: ['admin'] },
    { path: '/appointments', label: 'Citas', roles: ['patient', 'doctor'] },
    { path: '/doctors', label: 'Médicos', roles: ['patient'] },
    { path: '/admin/users', label: 'Usuarios', roles: ['admin'] }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  get currentUser(): User | null {
    return this.authService.currentUserValue;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  getRoleDisplayName(role?: string): string {
    if (!role) return 'Usuario';
    
    switch (role) {
      case 'patient': return 'Paciente';
      case 'doctor': return 'Médico';
      case 'admin': return 'Administrador';
      default: return 'Usuario';
    }
  }

  hasAccess(roles: string[]): boolean {
    const userRole = this.currentUser?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  // MÉTODOS SIMPLES PARA EL POPUP
  logout(): void {
    this.showLogoutPopup = true;
    this.showUserMenu = false;
  }

  cancelLogout(): void {
    this.showLogoutPopup = false;
  }

  executeLogout(): void {
    this.showLogoutPopup = false;
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.showUserMenu = false;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getUserInitial(): string {
    if (!this.currentUser?.name) return 'U';
    return this.currentUser.name.charAt(0).toUpperCase();
  }

  trackByPath(index: number, item: any): string {
    return item.path;
  }
}
