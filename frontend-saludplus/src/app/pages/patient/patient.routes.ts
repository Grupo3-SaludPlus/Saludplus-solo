import { Routes } from '@angular/router';
import { PatientLayoutComponent } from '../../layouts/patient-layout/patient-layout.component';
import { PatientDashboardComponent } from './patient-dashboard/patient-dashboard.component';
import { MyAppointmentsComponent } from './my-appointments/my-appointments.component';
import { AppointmentsHistoryComponent } from './appointments-history/appointments-history.component';
import { ProfileComponent } from './profile/profile.component';
import { MedicalHistoryComponent } from './medical-history/medical-history.component';

export const patientRoutes: Routes = [
  {
    path: '',
    component: PatientLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PatientDashboardComponent },
      { path: 'appointments', component: MyAppointmentsComponent },
      { path: 'appointments/history', component: AppointmentsHistoryComponent },

      { path: 'profile', component: ProfileComponent },
      { path: 'medical-history', component: MedicalHistoryComponent }
    ]
  }
];