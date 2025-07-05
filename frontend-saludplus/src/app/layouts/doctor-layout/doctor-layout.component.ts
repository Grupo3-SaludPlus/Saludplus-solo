import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../services/api.service';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
}

@Component({
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './doctor-layout.component.html',
  styleUrls: ['./doctor-layout.component.css']
})
export class DoctorLayoutComponent implements OnInit, OnDestroy {
  // ✅ AÑADIDO: Todas las propiedades que faltan
  doctorSpecialty: string = 'Medicina General';
  doctorName: string = '';
  currentDate: Date = new Date();
  userInitials: string = 'DR';
  
  // Estados de la UI
  showNotifications: boolean = false;
  showUserMenu: boolean = false;
  sidebarCollapsed: boolean = false;
  
  // Notificaciones
  notificationCount: number = 0;
  notifications: Notification[] = [];
  
  // Suscripciones
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Actualizar fecha cada minuto
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);

    // Suscribirse a cambios del usuario
    this.subscription.add(
      this.authService.currentUser$.subscribe((user: User | null) => {
        if (user) {
          this.doctorSpecialty = user.specialty || 'Medicina General';
          this.doctorName = user.name || 'Doctor';
          this.userInitials = this.getUserInitials(user.name || 'Doctor');
          this.loadNotifications();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // ✅ AÑADIDO: Método para obtener iniciales
  private getUserInitials(name: string): string {
    if (!name) return 'DR';
    
    const names = name.trim().split(' ').filter(n => n.length > 0);
    
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    } else if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    
    return 'DR';
  }

  // ✅ AÑADIDO: Cargar notificaciones
  private loadNotifications() {
    this.notifications = [
      {
        id: 1,
        title: 'Nueva cita agendada',
        message: 'Ana García ha agendado una cita para mañana a las 10:00',
        time: 'Hace 5 minutos',
        icon: 'fas fa-calendar-plus',
        type: 'info',
        read: false
      },
      {
        id: 2,
        title: 'Recordatorio',
        message: 'Tienes 3 citas pendientes para hoy',
        time: 'Hace 15 minutos',
        icon: 'fas fa-clock',
        type: 'warning',
        read: false
      }
    ];
    
    this.notificationCount = this.notifications.filter(n => !n.read).length;
  }

  // ✅ AÑADIDO: Toggle sidebar
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // ✅ AÑADIDO: Toggle notificaciones
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  // ✅ AÑADIDO: Toggle menú de usuario
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  // ✅ AÑADIDO: Cerrar menú de usuario
  closeUserMenu() {
    this.showUserMenu = false;
  }

  // ✅ AÑADIDO: Cerrar todos los dropdowns
  closeAllDropdowns() {
    this.showNotifications = false;
    this.showUserMenu = false;
  }

  // ✅ AÑADIDO: Cerrar dropdowns al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    
    if (!target.closest('.notification-container') && 
        !target.closest('.user-menu-container')) {
      this.closeAllDropdowns();
    }
  }

  // ✅ AÑADIDO: Método de logout
  logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}