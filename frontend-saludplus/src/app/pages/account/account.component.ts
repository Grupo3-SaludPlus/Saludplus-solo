import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  isLoggedIn = false;
  userName = '';
  userRole = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario ya está logueado
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.isLoggedIn = true;
      this.userName = currentUser.name;
      this.userRole = currentUser.role;
      
      // Redirigir al dashboard correspondiente según el rol
      if (currentUser.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (currentUser.role === 'doctor') {
        this.router.navigate(['/doctor/dashboard']);
      } else if (currentUser.role === 'patient') {
        this.router.navigate(['/appointments']);
      }
    }
  }
}
