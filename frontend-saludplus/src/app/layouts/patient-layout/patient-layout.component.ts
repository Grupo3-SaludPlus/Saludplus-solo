import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../services/api.service';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './patient-layout.component.html',
  styleUrls: ['./patient-layout.component.css']
})
export class PatientLayoutComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) return 'P';
    return this.currentUser.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout() {
    this.authService.logout();
  }
}