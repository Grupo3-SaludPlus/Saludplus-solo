import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Verificar si el usuario está logueado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: state.url,
          message: 'Necesitas iniciar sesión para acceder al panel de administración'
        }
      });
      return false;
    }
    
    // Verificar si el usuario tiene rol de administrador
    if (!this.authService.hasRole('admin')) {
      this.router.navigate(['/'], {
        queryParams: {
          error: 'No tienes permisos para acceder al panel de administración'
        }
      });
      return false;
    }
    
    // Usuario logueado y con rol de admin
    return true;
  }
}