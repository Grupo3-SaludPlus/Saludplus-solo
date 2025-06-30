import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Importar servicios
import { AuthService } from './app/services/auth.service';
import { ApiService } from './app/services/api.service';
import { SharedAppointmentsService } from './app/services/shared-appointments.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    
    // Registrar servicios explícitamente
    AuthService,
    ApiService,
    SharedAppointmentsService
  ]
}).catch(err => console.error(err));
