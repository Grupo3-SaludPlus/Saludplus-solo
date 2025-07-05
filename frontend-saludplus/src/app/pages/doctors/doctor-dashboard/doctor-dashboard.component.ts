import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ApiService, User } from '../../../services/api.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  currentUser: User | null = null;
  editableUser: User | null = null;
  profileSaved = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      // Hacer una copia editable
      this.editableUser = user ? { ...user } : null;
    });
  }

  saveProfile() {
    if (!this.editableUser) return;
    this.apiService.updateProfile(this.editableUser).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.editableUser = { ...updatedUser };
        this.profileSaved = true;
        setTimeout(() => this.profileSaved = false, 2000);
      },
      error: (err) => {
        alert('Error al guardar el perfil: ' + (err.message || err));
      }
    });
  }
}