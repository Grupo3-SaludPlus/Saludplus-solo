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
    if (this.email && this.password && this.userType) {
      this.isLoading = true;
      this.errorMessage = '';
      
      // ✅ CORREGIDO: Solo pasar email y password al método login
      this.authService.login(this.email, this.password).subscribe({
        next: (response) => {
          console.log('✅ Login successful:', response);
          this.isLoading = false;
          
          // ✅ AÑADIDO: Verificar el tipo de usuario después del login
          if (response.user) {
            const userRole = response.user.role || response.user.type;
            
            // Verificar que el rol coincida con el tipo seleccionado
            if (userRole === this.userType) {
              // Navegar según el tipo de usuario
              if (this.userType === 'patient') {
                this.router.navigate(['/patient/dashboard']);
              } else if (this.userType === 'doctor') {
                this.router.navigate(['/doctor/dashboard']);
              }
            } else {
              this.errorMessage = `Este usuario no tiene permisos de ${this.userType === 'patient' ? 'paciente' : 'doctor'}`;
            }
          }
        },
        error: (error) => {
          console.error('❌ Login error:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error en el login. Verifique sus credenciales.';
        }
      });
    } else {
      this.errorMessage = 'Por favor, complete todos los campos';
    }
  }
}