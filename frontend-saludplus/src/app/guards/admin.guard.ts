import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  } else {
    if (authService.isLoggedIn()) {
      // Redirigir según el rol
      const role = authService.getUserRole();
      if (role === 'doctor') {
        router.navigate(['/doctor']);
      } else if (role === 'patient') {
        router.navigate(['/patient']);
      }
    } else {
      router.navigate(['/login']);
    }
    return false;
  }
};