import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// ✅ SOLO IMPORTAR SERVICIOS QUE EXISTEN
import { AuthService } from './app/services/auth.service';
import { ApiService } from './app/services/api.service';
import { AppointmentsService } from './app/services/appointments.service';
import { DoctorsService } from './app/services/doctors.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    
    // ✅ REGISTRAR SOLO SERVICIOS QUE EXISTEN
    AuthService,
    ApiService,
    AppointmentsService,
    DoctorsService
  ]
}).catch(err => console.error(err));
