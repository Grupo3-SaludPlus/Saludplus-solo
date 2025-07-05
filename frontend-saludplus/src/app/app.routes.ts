import { Routes } from '@angular/router';
import { HomeComponent } from './shared/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { DoctorsComponent } from './pages/doctors/doctors.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ApiTesterComponent } from '../app/pages/api-tester/api-tester.component';
import { AdminDashboardComponent } from './admin/components/dashboard/admin-dashboard.component';
import { DoctorDashboardComponent } from './pages/doctors/doctor-dashboard/doctor-dashboard.component';
import { PatientDashboardComponent } from './pages/patient/patient-dashboard/patient-dashboard.component';


export const routes: Routes = [

  { path: 'api-tester', component: ApiTesterComponent },
  
  // ✅ PÁGINA PRINCIPAL (primera que se ve)
  { path: '', component: HomeComponent },
  
  // Rutas de autenticación
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Rutas públicas
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'doctors', component: DoctorsComponent },
  
  // Rutas protegidas de Admin
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  },
  
  // Rutas protegidas de Paciente
  {
    path: 'patient',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/patient/patient.routes').then(m => m.patientRoutes)
  },
  
  // Rutas protegidas de Doctor
  {
    path: 'doctor',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/doctors/doctor.routes').then(m => m.doctorRoutes)
  },
  
    { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'doctor/dashboard', 
    component: DoctorDashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'patient/dashboard', 
    component: PatientDashboardComponent,
    canActivate: [AuthGuard]
  },
  
  // Otras rutas...

  // Redirigir rutas no encontradas a home
  { path: '**', 
    redirectTo: '' },
  
];