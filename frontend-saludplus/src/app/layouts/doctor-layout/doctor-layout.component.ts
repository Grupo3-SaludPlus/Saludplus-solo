import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './doctor-layout.component.html',
  styleUrls: ['./doctor-layout.component.css']
})
export class DoctorLayoutComponent {
  doctorName: string = '';
  userInitials: string = '';
  doctorSpecialty: string = '';
  currentDate: Date = new Date();
  notificationCount: number = 0;
  
  constructor(private authService: AuthService) {
    this.authService.currentUser.subscribe(user => {
      if (user && user.role === 'doctor') {
        this.doctorName = user.name || 'Doctor';
        this.doctorSpecialty = user.specialty || '';
        this.userInitials = this.getInitials(user.name || '');
      }
    });
  }
  
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  logout() {
    this.authService.logout();
  }
}