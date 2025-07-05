import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { DoctorLayoutComponent } from './layouts/doctor-layout/doctor-layout.component';

// ✅ CORREGIDO: Función guard que retorna Observable/Promise/boolean
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // ✅ CORREGIDO: Sin paréntesis si es un getter
  if (authService.isAuthenticated) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  
  // Rutas de paciente
  {
    path: 'patient',
    loadComponent: () => import('./layouts/patient-layout/patient-layout.component').then(m => m.PatientLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/patient/patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./pages/patient/my-appointments/my-appointments.component').then(m => m.MyAppointmentsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Rutas de doctor
  {
    path: 'doctor',
    component: DoctorLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/doctors/doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./pages/doctors/doctor-appointments/doctor-appointments.component').then(m => m.DoctorAppointmentsComponent)
      },
      {
        path: 'patients',
        loadComponent: () => import('./pages/doctors/my-patients/my-patients.component').then(m => m.MyPatientsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Ruta comodín
  {
    path: '**',
    redirectTo: '/login'
  }
];