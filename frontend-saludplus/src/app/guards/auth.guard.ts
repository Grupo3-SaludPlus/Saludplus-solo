import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user || user.role !== 'admin') {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }
}

import { CanActivateFn } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  // tu lógica aquí
  return true;
};