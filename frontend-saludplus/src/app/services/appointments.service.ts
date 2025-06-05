import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Asegúrate de que esta interfaz es la que se está utilizando
export interface MedicalAppointment {
  id: number;
  patientId: number;
  patientName: string;
  patientAge?: number;
  doctorId: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  endTime?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'emergency';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  room?: string;
  location?: string;
  notes?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private STORAGE_KEY = 'saludplus_appointments';
  private appointmentsSubject = new BehaviorSubject<MedicalAppointment[]>([]);
  private appointmentsLoaded = false;
  
  constructor() {
    this.loadAppointments();
  }
  
  // Cargar citas del localStorage
  private loadAppointments(): void {
    if (this.appointmentsLoaded) return;
    
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    let appointments: MedicalAppointment[] = [];
    
    if (storedData) {
      try {
        appointments = JSON.parse(storedData);
      } catch (e) {
        console.error('Error al cargar citas:', e);
      }
    }
    
    this.appointmentsSubject.next(appointments);
    this.appointmentsLoaded = true;
  }
  
  // Guardar citas en localStorage
  private saveToStorage(appointments: MedicalAppointment[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(appointments));
    } catch (e) {
      console.error('Error al guardar citas:', e);
    }
  }
  
  // Obtener todas las citas
  getAllAppointments(): Observable<MedicalAppointment[]> {
    if (!this.appointmentsLoaded) {
      this.loadAppointments();
    }
    return this.appointmentsSubject.asObservable();
  }
  
  // NUEVO MÉTODO: Crear una nueva cita
  createAppointment(appointmentData: Omit<MedicalAppointment, 'id' | 'createdAt'>): MedicalAppointment {
    const appointments = this.appointmentsSubject.value;
    
    // Generar un ID único para la nueva cita
    const newId = appointments.length > 0 
      ? Math.max(...appointments.map(a => a.id)) + 1 
      : 1;
    
    // Crear el objeto de la nueva cita
    const newAppointment: MedicalAppointment = {
      ...appointmentData,
      id: newId,
      createdAt: new Date()
    };
    
    // Agregar la cita a la lista
    const updatedAppointments = [...appointments, newAppointment];
    
    // Actualizar el BehaviorSubject y guardar en localStorage
    this.appointmentsSubject.next(updatedAppointments);
    this.saveToStorage(updatedAppointments);
    
    console.log('Cita creada:', newAppointment);
    console.log('Total de citas:', updatedAppointments.length);
    
    return newAppointment;
  }
  
  // Actualizar el estado de una cita
  updateAppointmentStatus(id: number, status: MedicalAppointment['status']): MedicalAppointment | null {
    const appointments = this.appointmentsSubject.value;
    const index = appointments.findIndex(a => a.id === id);
    
    if (index === -1) return null;
    
    // Crear una copia actualizada de la cita
    const updated: MedicalAppointment = {
      ...appointments[index],
      status: status
    };
    
    // Actualizar la lista de citas
    const updatedAppointments = [...appointments];
    updatedAppointments[index] = updated;
    
    this.appointmentsSubject.next(updatedAppointments);
    this.saveToStorage(updatedAppointments);
    
    return updated;
  }
  
  // Actualizar cualquier dato de una cita
  updateAppointment(updatedData: Partial<MedicalAppointment>): MedicalAppointment | null {
    if (!updatedData.id) return null;
    
    const appointments = this.appointmentsSubject.value;
    const index = appointments.findIndex(a => a.id === updatedData.id);
    
    if (index === -1) return null;
    
    // Crear una copia actualizada de la cita
    const updated: MedicalAppointment = {
      ...appointments[index],
      ...updatedData
    };
    
    // Actualizar la lista de citas
    const updatedAppointments = [...appointments];
    updatedAppointments[index] = updated;
    
    this.appointmentsSubject.next(updatedAppointments);
    this.saveToStorage(updatedAppointments);
    
    return updated;
  }
  
  // Obtener citas de un paciente específico
  getPatientAppointments(patientId: number): Observable<MedicalAppointment[]> {
    // Asegurar que las citas estén cargadas
    if (!this.appointmentsLoaded) {
      this.loadAppointments();
    }
    
    // Crear un nuevo BehaviorSubject filtrado
    const patientAppointmentsSubject = new BehaviorSubject<MedicalAppointment[]>(
      this.appointmentsSubject.value.filter(a => a.patientId === patientId)
    );
    
    // Suscribirse a cambios en el subject principal y filtrar
    this.appointmentsSubject.subscribe(appointments => {
      patientAppointmentsSubject.next(appointments.filter(a => a.patientId === patientId));
    });
    
    return patientAppointmentsSubject.asObservable();
  }
}