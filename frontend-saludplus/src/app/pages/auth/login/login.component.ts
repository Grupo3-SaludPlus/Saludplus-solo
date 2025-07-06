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
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.email && this.password) {
      this.isLoading = true;
      this.errorMessage = '';
      this.authService.login(this.email, this.password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.user) {
            const userRole = response.user.role || response.user.type;
            // Redirige según el rol recibido
            if (userRole === 'patient') {
              this.router.navigate(['/patient/dashboard']);
            } else if (userRole === 'doctor') {
              this.router.navigate(['/doctor/dashboard']);
            } else if (userRole === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.errorMessage = 'Rol de usuario desconocido.';
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error en el login. Verifique sus credenciales.';
        }
      });
    } else {
      this.errorMessage = 'Por favor, complete todos los campos';
    }
  }
}