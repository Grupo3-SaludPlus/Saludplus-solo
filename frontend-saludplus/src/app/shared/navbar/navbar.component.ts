import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../services/api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [
    CommonModule,       // ← Para *ngIf, *ngFor, etc.
    RouterLink,         // ← Para routerLink
    RouterLinkActive    // ← Para routerLinkActive
  ]
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  showUserMenu = false;
  showLogoutPopup = false;
  currentUser: User | null = null;
  isLoggedIn = false;
  isMenuOpen = false;

  navItems = [
    { path: '/', label: 'Inicio', roles: ['admin', 'doctor', 'patient'] },
    { path: '/doctors', label: 'Nuestros Médicos', roles: ['admin', 'doctor', 'patient'] },
    { path: '/appointments', label: 'Agenda', roles: ['admin', 'doctor', 'patient'] }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  // ✅ MÉTODO para manejar Mi Cuenta
  goToMyAccount(event: Event) {
    event.preventDefault();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Redirigir según el rol del usuario
    switch (this.currentUser.role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'doctor':
        this.router.navigate(['/doctor/dashboard']);
        break;
      case 'patient':
        this.router.navigate(['/patient/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
    
    this.closeMenu();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
    this.showUserMenu = false;
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
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

  logout(event?: Event) {
    if (event) {
      event.preventDefault();
    }
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
