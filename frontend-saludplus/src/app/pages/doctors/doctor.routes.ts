import { Routes } from '@angular/router';
import { DoctorLayoutComponent } from '../../layouts/doctor-layout/doctor-layout.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';
import { DoctorAppointmentsComponent } from './doctor-appointments/doctor-appointments.component';
// Si tienes estos componentes, déjalos; si no, puedes comentarlos o eliminarlos
//import { PatientManagementComponent } from './patient-management/patient-management.component';
//import { ScheduleComponent } from './schedule/schedule.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';

export const doctorRoutes: Routes = [
  {
    path: '',
    component: DoctorLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DoctorDashboardComponent },
      { path: 'appointments', component: DoctorAppointmentsComponent },
      // Si tienes estos componentes, déjalos; si no, puedes comentarlos o eliminarlos
      //{ path: 'patients', component: PatientManagementComponent },
      //{ path: 'schedule', component: ScheduleComponent },
      { path: 'profile', component: DoctorProfileComponent }
    ]
  }
];