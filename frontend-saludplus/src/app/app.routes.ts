import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { DoctorLayoutComponent } from './layouts/doctor-layout/doctor-layout.component';

// Mantenemos el guard actual
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const routes: Routes = [
  // ✅ PÁGINA PRINCIPAL (primera que se ve)
  {
    path: '',
    loadComponent: () => import('./shared/home/home.component').then(m => m.HomeComponent)
  },
  
  // Rutas de autenticación
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  
  
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  
  {
  path: 'registro-medico',
    loadComponent: () =>
      import('./pages/doctors/registro-medico/registro-medico.component')
        .then(m => m.RegistroMedicoComponent)
  
  },


  // Rutas públicas

  
  {
    path: 'appointments',
    loadComponent: () => import('./pages/appointments/appointments.component').then(m => m.AppointmentsComponent)
  },
  {
    path: 'doctors',
    loadComponent: () => import('./pages/doctors/doctors.component').then(m => m.DoctorsComponent)
  },
  
  // Rutas de paciente (protegidas)
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
      },
      // Redirección para rutas no encontradas dentro de patient
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  },

  // Rutas de doctor (protegidas)
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
      },
      // Redirección para rutas no encontradas dentro de doctor
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  },

  // Ruta API Tester (como en la configuración anterior)
  {
    path: 'api-tester',
    loadComponent: () => import('./pages/api-tester/api-tester.component').then(m => m.ApiTesterComponent)
  },

  // Ruta comodín - redirigir a home como en la configuración anterior
  {
    path: '**', 
    redirectTo: ''
  }
];