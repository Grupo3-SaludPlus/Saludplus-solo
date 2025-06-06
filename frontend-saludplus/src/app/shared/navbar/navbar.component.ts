import { Component, ElementRef, HostListener } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgIf, NgForOf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [NgIf, NgForOf, RouterLink, RouterLinkActive]
})
export class NavbarComponent {
  menuOpen = false;
  showUserMenu = false;
  showLogoutPopup = false;
  currentUser: User | null = null;

  navItems = [
    { path: '/', label: 'Inicio', roles: ['admin', 'doctor', 'patient'] },
    { path: '/doctors', label: 'Nuestros Médicos', roles: ['admin', 'doctor', 'patient'] },
    { path: '/appointments', label: 'Agenda', roles: ['admin', 'doctor', 'patient'] },
    { path: '/account', label: 'Mi Cuenta', roles: ['admin', 'doctor', 'patient'] }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  hasAccess(roles: string[]): boolean {
    if (!roles) return true;
    if (!this.currentUser) return false;
    return roles.includes(this.currentUser.role as string);
  }

  getUserInitial(): string {
    if (!this.currentUser || !this.currentUser.name) return '';
    return this.currentUser.name.trim().charAt(0).toUpperCase();
  }

  getRoleDisplayName(role: string | undefined): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'doctor': return 'Médico';
      case 'patient': return 'Paciente';
      default: return '';
    }
  }

  trackByPath(index: number, item: any) {
    return item.path;
  }

  cancelLogout() {
    this.showLogoutPopup = false;
  }

  executeLogout() {
    this.showLogoutPopup = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.currentUser = null;
    this.showUserMenu = false;
    this.menuOpen = false;
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const userMenuElement = this.elementRef.nativeElement.querySelector('.user-menu');
    if (userMenuElement && !userMenuElement.contains(event.target as Node) && this.showUserMenu) {
      this.showUserMenu = false;
    }
  }
}
