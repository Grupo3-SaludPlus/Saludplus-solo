import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard.component';
import { UsersManagementComponent } from './components/users/users-management.component';
import { AppointmentsManagementComponent } from './components/appointments/appointments-management.component';
import { DoctorsManagementComponent } from './components/doctors/doctors-management.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SettingsComponent } from './components/settings/settings.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UsersManagementComponent },
      { path: 'appointments', component: AppointmentsManagementComponent },
      { path: 'doctors', component: DoctorsManagementComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];