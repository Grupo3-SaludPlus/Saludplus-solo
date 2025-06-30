import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService, User } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {
  private apiUrl = 'http://localhost:8000/api/';

  // Clave única para todos los datos del sistema
  private MASTER_KEY = 'saludplus_master_data';
  
  // Estado de los datos de la aplicación
  private appData: {
    users: User[];
    appointments: any[];
    medicalRecords: any[];
    lastUpdate: string;
  };
  
  // Observables para notificar cambios
  private dataSubject = new BehaviorSubject<any>(null);
  
  // Referencia al servicio de autenticación (será inicializada más tarde)
  private authService: AuthService | null = null;
  
  constructor(private injector: Injector, private http: HttpClient) {
    // Inicializar con datos vacíos
    this.appData = {
      users: [],
      appointments: [],
      medicalRecords: [],
      lastUpdate: new Date().toISOString()
    };
    
    // NO inyectar AuthService aquí para evitar la dependencia circular
    
    // Cargar datos al iniciar
    setTimeout(() => {
      this.loadAllData();
    });
  }
  
  // Método para acceder a AuthService de forma tardía
  private getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = this.injector.get(AuthService);
    }
    return this.authService;
  }
  
  // Cargar todos los datos del sistema
  loadAllData(): void {
    console.log('DataManagerService: Iniciando carga de datos');
    const storedData = API.getItem(this.MASTER_KEY);
    
    if (storedData) {
      try {
        this.appData = JSON.parse(storedData);
        console.log('DataManagerService: Datos cargados desde API', {
          usuarios: this.appData.users.length,
          citas: this.appData.appointments.length
        });
      } catch (e) {
        console.error('Error al cargar datos:', e);
        this.initializeWithUserData();
      }
    } else {
      console.log('DataManagerService: No se encontraron datos, inicializando desde usuarios existentes');
      this.initializeWithUserData();
    }
    
    this.dataSubject.next(this.appData);
  }
  
  // Inicializar con datos de usuarios existentes (migración)
  private initializeWithUserData(): void {
    console.log('DataManagerService: Inicializando datos desde usuarios');
    // Usar la inyección tardía para obtener los usuarios
    const authService = this.getAuthService();
    if (!authService) {
      console.error('DataManagerService: No se pudo obtener AuthService');
      return;
    }
    
    const users = authService.getRegisteredUsers();
    console.log('DataManagerService: Usuarios recuperados', users.length);
    
    this.appData = {
      users: users,
      appointments: [],
      medicalRecords: [],
      lastUpdate: new Date().toISOString()
    };
    
    // Guardar estructura inicial
    this.saveAllData();
  }
  
  // Guardar todos los datos
  private saveAllData(): void {
    this.appData.lastUpdate = new Date().toISOString();
    API.setItem(this.MASTER_KEY, JSON.stringify(this.appData));
    this.dataSubject.next(this.appData);
  }
  
  // Obtener todos los usuarios
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}users/`);
  }
  
  // Obtener todos los pacientes
  getAllPatients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}patients/`);
  }
  
  // Obtener citas de un paciente
  getPatientAppointments(patientId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}appointments/?patient=${patientId}`);
  }
  
  // Actualizar un paciente
  updatePatient(patient: User): void {
    const index = this.appData.users.findIndex(u => u.id === patient.id);
    if (index !== -1) {
      this.appData.users[index] = {...patient};
      this.saveAllData();
    }
  }
  
  // Exportar datos de un paciente como texto
  exportPatientAsText(patientId: string | number): Observable<string> {
    return this.http.get(`${this.apiUrl}patients/${patientId}/export/`, { responseType: 'text' });
  }

  // Escuchar cambios en los datos
  getDataUpdates(): Observable<any> {
    return this.dataSubject.asObservable();
  }

  /**
   * Carga todos los pacientes y los devuelve en formato de texto estructurado
   * @returns Array con la representación en texto de cada paciente
   */
  loadpatient(): string[] {
    console.log('Iniciando carga de pacientes en formato texto...');
    
    try {
      // Obtener todos los pacientes del sistema
      const patients = this.getAllPatients();
      console.log(`Encontrados ${patients.length} pacientes para procesar`);
      
      if (!patients.length) {
        return ['No se encontraron pacientes en el sistema'];
      }
      
      // Convertir cada paciente a formato texto
      const patientTexts = patients.map(patient => {
        // Obtener sus citas
        const appointments = this.getPatientAppointments(patient.id);
        const apptCount = appointments.length;
        const lastAppt = appointments.length > 0 ? 
          this.getSafeLastAppointmentDate(appointments) :
          'Sin citas';
        
        // Usar el mismo formato que exportPatientAsText
        return `
${patient.name}

ID: ${patient.id}
Edad: ${this.calculateAge(patient.birthdate)} años
Género: ${patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'}
Teléfono: ${patient.phone || 'No registrado'}
Email: ${patient.email}
Tipo de sangre: ${patient.bloodType || 'No registrado'}
Seguro: ${patient.insurance || 'No registrado'}
Alergias: ${patient.allergies?.length ? patient.allergies.join(', ') : 'Ninguna'}
Enfermedades crónicas: ${patient.chronic?.length ? patient.chronic.join(', ') : 'Ninguna'}
Estado: ${patient.status === 'active' ? 'Activo' : patient.status === 'inactive' ? 'Inactivo' : patient.status === 'critical' ? 'Crítico' : 'Desconocido'}
Última visita: ${lastAppt}
Total visitas: ${apptCount}
`;
      });
      
      console.log(`Procesados ${patientTexts.length} perfiles de pacientes`);
      return patientTexts;
      
    } catch (error) {
      console.error('Error al cargar pacientes en formato texto:', error);
      return ['Error al cargar datos de pacientes'];
    }
  }

  /**
   * Crea un usuario específico llamado Juan Pérez
   * @returns El usuario creado o null si hubo un error
   */
  createJuanPerez(): User | null {
    try {
      console.log('Creando usuario Juan Pérez...');
      
      // Crear ID único pero reconocible
      const userId = 'patient-juanperez-' + Date.now();
      
      // Crear usuario con datos específicos
      const juanPerez: User = {
        id: userId,
        name: 'Kamaguanyo Joestar',
        email: 'juan.perez@ejemplo.com',
        password: 'password123',
        role: 'patient',
        phone: '+56 9 87654321',
        birthdate: '1978-05-15',
        gender: 'M',
        bloodType: 'O+',
        insurance: 'Fonasa',
        allergies: ['Penicilina', 'Polen', 'Mariscos'],
        chronic: ['Hipertensión', 'Diabetes tipo 2'],
        emergencyContact: '+56 9 12345678',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // Añadir a appData
      this.appData.users.push(juanPerez);
      
      // Crear una cita para el paciente
      const appointment = {
        id: 'apt-' + Date.now(),
        patientId: userId,
        patientName: 'Juan Pérez',
        doctorId: 'doctor-001',
        doctorName: 'Dr. María Rodríguez',
        specialty: 'Medicina general',
        date: '2025-06-20',
        time: '10:00',
        status: 'scheduled',
        notes: 'Control rutinario de hipertensión y diabetes.'
      };
      
      // Añadir la cita
      this.appData.appointments.push(appointment);
      
      // Guardar cambios
      this.saveAllData();
      
      // También guardar en API para compatibilidad con el resto del sistema
      const authService = this.getAuthService();
      if (authService) {
        const users = authService.getRegisteredUsers();
        
        // Verificar si ya existe un Juan Pérez
        const existingIdx = users.findIndex(u => u.email === juanPerez.email);
        if (existingIdx >= 0) {
          users[existingIdx] = juanPerez;
        } else {
          users.push(juanPerez);
        }
        
        // Guardar en API
        API.setItem('saludplus_users', JSON.stringify(users));
        API.setItem('users', JSON.stringify(users));
      }
      
      console.log('Usuario Juan Pérez creado exitosamente:', juanPerez);
      return juanPerez;
      
    } catch (error) {
      console.error('Error al crear usuario Juan Pérez:', error);
      return null;
    }
  }

  /**
   * Registra un nuevo usuario y sincroniza todos los sistemas de almacenamiento
   * @param userData Datos del usuario a registrar
   * @returns El usuario registrado o null si hubo un error
   */
  registerNewUser(userData: Partial<User>, password: string): User | null {
    try {
      console.log('DataManagerService: Registrando nuevo usuario...');
      
      const authService = this.getAuthService();
      if (!authService) {
        console.error('No se pudo acceder a AuthService');
        return null;
      }
      
      // Usar solo registerPatient que sí existe
      const registeredUser = authService.registerPatient(userData, password);
      
      if (!registeredUser) {
        console.error('Error al registrar usuario en AuthService');
        return null;
      }
      
      // Sincronizar con DataManagerService
      this.syncUserWithDataManager(registeredUser);
      
      return registeredUser;
    } catch (error) {
      console.error('Error en registerNewUser:', error);
      return null;
    }
  }

  /**
   * Sincroniza un usuario entre AuthService y DataManagerService
   */
  private syncUserWithDataManager(user: User): void {
    // Verificar si ya existe en appData
    const existingIndex = this.appData.users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      // Actualizar usuario existente
      this.appData.users[existingIndex] = {...user};
    } else {
      // Añadir nuevo usuario
      this.appData.users.push(user);
    }
    
    // Guardar cambios
    this.saveAllData();
    
    // Notificar sobre el cambio
    this.dataSubject.next(this.appData);
  }

  // Manejo seguro de fechas para la última cita
  private getSafeLastAppointmentDate(appointments: any[]): string {
    try {
      const validDates = appointments
        .filter(a => a.date) // Filtrar solo citas con fecha
        .map(a => {
          try {
            return new Date(a.date).getTime();
          } catch (e) {
            return 0; // Fecha inválida
          }
        })
        .filter(time => time > 0); // Filtrar fechas válidas
    
      if (validDates.length === 0) return 'Fecha desconocida';
    
      return new Date(Math.max(...validDates)).toLocaleDateString();
    } catch (error) {
      console.error('Error al procesar fechas de citas:', error);
      return 'Error de fecha';
    }
  }
}