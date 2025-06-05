import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router, 
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Verificar si el usuario está autenticado y tiene rol de administrador
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      return true;
    }
    
    // Si no es admin pero está logueado, redirigir a la página principal
    if (this.authService.isLoggedIn()) {
      // Mostrar mensaje opcional
      alert('Acceso denegado. Se requieren privilegios de administrador.');
      
      // Redirigir según el rol del usuario
      if (this.authService.isDoctor()) {
        return this.router.parseUrl('/doctor/dashboard');
      } else if (this.authService.isPatient()) {
        return this.router.parseUrl('/patient/dashboard');
      } else {
        return this.router.parseUrl('/');
      }
    }
    
    // Si no está logueado, redirigir al login
    return this.router.parseUrl('/login');
  }
}