import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  userType: 'patient' | 'doctor' | 'admin' = 'patient';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, complete todos los campos';
      this.isLoading = false;
      return;
    }

    const loginSuccessful = this.authService.login(this.email, this.password, this.userType);
    
    if (loginSuccessful) {
      // Redirigir según el tipo de usuario
      if (this.userType === 'doctor') {
        this.router.navigate(['/doctor/dashboard']);
      } else if (this.userType === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/patient/dashboard']);
      }
    } else {
      this.errorMessage = 'Credenciales incorrectas';
      this.isLoading = false;
    }
  }
}