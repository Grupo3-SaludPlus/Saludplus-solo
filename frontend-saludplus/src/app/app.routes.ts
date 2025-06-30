import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { DoctorsComponent } from './pages/doctors/doctors.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { DoctorLayoutComponent } from './layouts/doctor-layout/doctor-layout.component';
import { DoctorDashboardComponent } from './pages/doctors/doctor-dashboard/doctor-dashboard.component';
import { DoctorAppointmentsComponent } from './pages/doctors/doctor-appointments/doctor-appointments.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'appointments', component: AppointmentsComponent, canActivate: [AuthGuard] },
  { path: 'doctors', component: DoctorsComponent },

  // Rutas de Admin
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./admin/components/dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/components/dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/components/users/users-management.component')
          .then(m => m.UsersManagementComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./admin/components/appointments/appointments-management.component')
          .then(m => m.AppointmentsManagementComponent)
      },
    ]
  },

  // Rutas de Paciente
  {
    path: 'patient',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/patient/patient-dashboard/patient-dashboard.component')
          .then(m => m.PatientDashboardComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/patient/patient-dashboard/patient-dashboard.component')
          .then(m => m.PatientDashboardComponent)
      }
    ]
  },

  // Rutas de Doctor
  {
    path: 'doctor',
    component: DoctorLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DoctorDashboardComponent
      },
      {
        path: 'dashboard',
        component: DoctorDashboardComponent
      },
      {
        path: 'appointments',
        component: DoctorAppointmentsComponent
      },
    ]
  },

  { path: '**', redirectTo: '/login' }
];