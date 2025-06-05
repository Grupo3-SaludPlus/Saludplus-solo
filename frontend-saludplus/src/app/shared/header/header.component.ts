import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  title: string = 'SaludPlus';
  slogan: string = 'Cuidando tu salud, siempre cerca de ti';

  currentUser: User | null = null;
  isLoggedIn = false;
  showUserMenu = false;
  
  constructor(
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu() {
    this.showUserMenu = false;
  }

  // SIMPLE logout para pacientes y médicos
  logout() {
    this.authService.logout();
    this.closeUserMenu();
  }

  getUserInitials(): string {
    if (this.currentUser?.name) {
      return this.currentUser.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    return 'U';
  }

  getUserRole(): string {
    switch(this.currentUser?.role) {
      case 'doctor': return 'Médico';
      case 'admin': return 'Administrador';
      case 'patient': return 'Paciente';
      default: return 'Usuario';
    }
  }
}