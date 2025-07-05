import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);

  if (!auth.isAuthenticated) {
    // Aquí podrías redirigir al login si quieres
    return false;
  }
  if (!auth.isAdmin()) {
    // Aquí podrías redirigir a otra página si quieres
    return false;
  }
  return true;
};