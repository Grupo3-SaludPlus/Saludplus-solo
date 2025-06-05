import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layouts/default-layout/default-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { DoctorsComponent } from './pages/doctors/doctors.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PatientDashboardComponent } from './pages/patient/patient-dashboard/patient-dashboard.component';
import { MyAppointmentsComponent } from './pages/patient/my-appointments/my-appointments.component';
import { DoctorDashboardComponent } from './pages/doctors/doctor-dashboard/doctor-dashboard.component';
import { AdminDashboardComponent } from './admin/components/dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Rutas principales con layout por defecto
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'profile', component: PatientDashboardComponent },
      { path: 'patient-dashboard', redirectTo: 'profile' },
      { path: 'my-appointments', component: MyAppointmentsComponent },
      { path: 'appointment-history', redirectTo: 'my-appointments' },
      { path: 'doctors', component: DoctorsComponent },
      { path: 'doctor-dashboard', component: DoctorDashboardComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ]
  },
  
  // RUTAS ADMIN SEPARADAS - SIN LAYOUT
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  
  
];