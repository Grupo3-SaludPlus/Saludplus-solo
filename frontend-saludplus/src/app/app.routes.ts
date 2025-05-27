import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DoctorsComponent } from './pages/doctors/doctors.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'doctors', component: DoctorsComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' }
];
