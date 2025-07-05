import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // AGREGAR ESTO
import { AuthService } from '../../services/auth.service';
import { User } from '../../services/api.service';

@Component({
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet], // AGREGAR RouterOutlet
  templateUrl: './doctor-layout.component.html',
  styleUrls: ['./doctor-layout.component.css']
})
export class DoctorLayoutComponent implements OnInit {
  doctorSpecialty: string = '';
  doctorName: string = '';
  currentDate: Date = new Date();
  notificationCount: number = 0;
  userInitials: string = ''; // AGREGAR ESTO

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.doctorSpecialty = user.specialty || 'Medicina General';
        this.doctorName = user.name || '';
        this.userInitials = this.getUserInitials(user.name || ''); // AGREGAR ESTO
      }
    });
  }

  // AGREGAR ESTE MÉTODO
  private getUserInitials(name: string): string {
    if (!name) return 'DR';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }

  logout() {
    this.authService.logout();
  }
}