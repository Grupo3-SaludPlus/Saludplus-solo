import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

// Interfaz común para datos de médicos
export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  image?: string; 
  rating?: number;
  education?: string;
  experience?: string;
  availability?: string;
  biography?: string;
  phoneNumber?: string;
  email: string;
  consultationFee?: number;
  isOnCall?: boolean;
  department?: string;
  license?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorsService {
  private localStorageKey = 'saludplus_doctors';
  private doctorsSubject = new BehaviorSubject<Doctor[]>(this.loadDoctors());
  private isBrowser: boolean;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Obtener todos los doctores como Observable
  getDoctors(): Observable<Doctor[]> {
    return this.doctorsSubject.asObservable();
  }

  // Obtener todos los doctores (valor actual)
  getAllDoctors(): Doctor[] {
    return this.doctorsSubject.getValue();
  }

  // Cargar doctores desde localStorage o usar datos predeterminados
  private loadDoctors(): Doctor[] {
    if (this.isBrowser) {
      try {
        const storedDoctors = localStorage.getItem(this.localStorageKey);
        if (storedDoctors) {
          return JSON.parse(storedDoctors);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }
    return this.getDefaultDoctors();
  }

  // Guardar doctores en localStorage
  saveDoctors(doctors: Doctor[]): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.localStorageKey, JSON.stringify(doctors));
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    }
    this.doctorsSubject.next(doctors);
  }

  // Actualizar un doctor
  updateDoctor(doctor: Doctor): void {
    const doctors = this.getAllDoctors();
    const index = doctors.findIndex(d => d.id === doctor.id);
    
    if (index !== -1) {
      // Asegurar que el doctor tenga un rating
      if (doctor.rating === undefined) {
        doctor.rating = doctors[index].rating || 4.0;
      }
      
      doctors[index] = doctor;
      this.saveDoctors(doctors);
    }
  }

  // Añadir un nuevo doctor
  addDoctor(doctor: Doctor): void {
    const doctors = this.getAllDoctors();
    // Asignar nuevo ID
    const newId = doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1;
    
    // Asegurar que el doctor tenga un rating
    if (doctor.rating === undefined) {
      doctor.rating = 4.0; // Valor predeterminado
    }
    
    doctor.id = newId;
    doctors.push(doctor);
    this.saveDoctors(doctors);
  }

  // Eliminar un doctor
  removeDoctor(id: number): void {
    const doctors = this.getAllDoctors().filter(d => d.id !== id);
    this.saveDoctors(doctors);
  }

  // Datos predeterminados si no hay datos en localStorage
  private getDefaultDoctors(): Doctor[] {
    return [
      {
        id: 1,
        name: "Dra. Carla Mendoza Torres",
        specialty: "Cardiología",
        image: "assets/img/doctors/doctor1.jpg",
        rating: 4.9,
        education: "Universidad de Chile, Especialización en Hospital Clínico UC",
        experience: "15 años de experiencia",
        availability: "Lunes a Jueves: 9:00 - 17:00",
        biography: "Especialista en cardiología intervencionista con enfoque en prevención cardiovascular. Ha publicado numerosos artículos en revistas médicas internacionales y participa activamente en investigaciones sobre nuevas terapias para la insuficiencia cardíaca.",
        phoneNumber: "+56 9 8765 4321",
        email: "carla.mendoza@saludplus.com",
        consultationFee: 120000,
        isOnCall: true,
        department: "Cardiología",
        license: "MC-12345"
      },
      {
        id: 2,
        name: "Dr. Roberto Álvarez Gómez",
        specialty: "Pediatría",
        image: "assets/img/doctors/doctor2.jpg",
        rating: 4.8,
        education: "Universidad Católica de Chile, Especialización en Boston Children's Hospital",
        experience: "12 años de experiencia",
        availability: "Martes a Sábado: 10:00 - 18:00",
        biography: "Pediatra con subespecialidad en neurología pediátrica. Se dedica especialmente al tratamiento de trastornos del desarrollo infantil y epilepsia. Coordinador del programa de detección temprana de trastornos neurológicos en SaludPlus.",
        phoneNumber: "+56 9 7654 3210",
        email: "roberto.alvarez@saludplus.com",
        consultationFee: 90000,
        isOnCall: false,
        department: "Pediatría",
        license: "MC-23456"
      },
      {
        id: 3,
        name: "Dra. Ana María Vásquez Ruiz",
        specialty: "Ginecología y Obstetricia",
        image: "assets/img/doctors/doctor3.jpg",
        rating: 4.7,
        education: "Universidad de Concepción, Especialización en Hospital La Paz, Madrid",
        experience: "18 años de experiencia",
        availability: "Lunes, Miércoles y Viernes: 8:00 - 16:00",
        biography: "Especialista en medicina materno-fetal y embarazos de alto riesgo. Cuenta con amplia experiencia en diagnóstico prenatal y es pionera en técnicas de cirugía fetal mínimamente invasiva en Chile.",
        phoneNumber: "+56 9 6543 2109",
        email: "anamaria.vasquez@saludplus.com",
        consultationFee: 95000,
        isOnCall: true,
        department: "Ginecología",
        license: "MC-34567"
      },
      {
        id: 4,
        name: "Dr. Felipe Rojas Contreras",
        specialty: "Traumatología",
        image: "assets/img/doctors/doctor4.jpg",
        rating: 4.9,
        education: "Universidad de Los Andes, Fellowship en Hospital for Special Surgery, Nueva York",
        experience: "10 años de experiencia",
        availability: "Lunes a Viernes: 14:00 - 20:00",
        biography: "Especialista en cirugía artroscópica y medicina deportiva. Ha trabajado como médico de equipos deportivos profesionales y se especializa en lesiones de rodilla y hombro en atletas de alto rendimiento.",
        phoneNumber: "+56 9 5432 1098",
        email: "felipe.rojas@saludplus.com",
        consultationFee: 110000,
        isOnCall: false,
        department: "Traumatología y Ortopedia",
        license: "MC-45678"
      },
      {
        id: 5,
        name: "Dra. Valentina Ortiz Miranda",
        specialty: "Dermatología",
        image: "assets/img/doctors/doctor5.jpg",
        rating: 4.6,
        education: "Universidad Austral de Chile, Especialización en Hospital Ramón y Cajal, Madrid",
        experience: "8 años de experiencia",
        availability: "Martes, Jueves y Sábado: 9:00 - 17:00",
        biography: "Especialista en dermatología clínica y estética. Con formación adicional en tratamientos láser y dermatología oncológica. Participa activamente en campañas de prevención del cáncer de piel.",
        phoneNumber: "+56 9 4321 0987",
        email: "valentina.ortiz@saludplus.com",
        consultationFee: 85000,
        isOnCall: false,
        department: "Dermatología",
        license: "MC-56789"
      },
      {
        id: 6,
        name: "Dr. Diego Fuentes Ramírez",
        specialty: "Neurología",
        image: "assets/img/doctors/doctor6.jpg",
        rating: 4.8,
        education: "Universidad de Santiago, Especialización en Johns Hopkins Hospital",
        experience: "14 años de experiencia",
        availability: "Lunes a Jueves: 8:00 - 16:00",
        biography: "Neurólogo especializado en trastornos del movimiento y enfermedad de Parkinson. Investigador principal en estudios clínicos sobre nuevas terapias para enfermedades neurodegenerativas.",
        phoneNumber: "+56 9 3210 9876",
        email: "diego.fuentes@saludplus.com",
        consultationFee: 115000,
        isOnCall: true,
        department: "Neurología",
        license: "MC-67890"
      },
      {
        id: 7,
        name: "Dra. Camila Riquelme Parra",
        specialty: "Endocrinología",
        image: "assets/img/doctors/doctor7.jpg",
        rating: 4.7,
        education: "Universidad Católica, Especialización en Hospital Universitario de Navarra",
        experience: "11 años de experiencia",
        availability: "Miércoles a Viernes: 10:00 - 18:00",
        biography: "Especialista en trastornos endocrinos y metabólicos, con particular enfoque en diabetes y patologías tiroideas. Directora del programa de educación en diabetes de SaludPlus.",
        phoneNumber: "+56 9 2109 8765",
        email: "camila.riquelme@saludplus.com",
        consultationFee: 95000,
        isOnCall: false,
        department: "Endocrinología",
        license: "MC-78901"
      },
      {
        id: 8,
        name: "Dr. Sebastián Montes Urrutia",
        specialty: "Gastroenterología",
        image: "assets/img/doctors/doctor8.jpg",
        rating: 4.5,
        education: "Universidad de Valparaíso, Especialización en Cleveland Clinic",
        experience: "9 años de experiencia",
        availability: "Lunes, Martes y Jueves: 11:00 - 19:00",
        biography: "Especialista en enfermedades digestivas y hepatología. Experto en endoscopía terapéutica y tratamiento de enfermedades inflamatorias intestinales. Investigador en nuevos tratamientos para la enfermedad de Crohn.",
        phoneNumber: "+56 9 1098 7654",
        email: "sebastian.montes@saludplus.com",
        consultationFee: 100000,
        isOnCall: true,
        department: "Gastroenterología",
        license: "MC-89012"
      },
      {
        id: 9,
        name: "Dra. Isabella Morales Gutiérrez",
        specialty: "Oncología",
        image: "assets/img/doctors/doctor9.jpg",
        rating: 4.9,
        education: "Universidad de Chile, Fellowship en MD Anderson Cancer Center",
        experience: "16 años de experiencia",
        availability: "Lunes a Viernes: 9:00 - 15:00",
        biography: "Especialista en oncología médica con enfoque en cáncer de mama y tumores ginecológicos. Pionera en tratamientos personalizados basados en perfiles genéticos tumorales. Participa en investigación clínica internacional.",
        phoneNumber: "+56 9 0987 6543",
        email: "isabella.morales@saludplus.com",
        consultationFee: 130000,
        isOnCall: false,
        department: "Oncología",
        license: "MC-90123"
      },
      {
        id: 10,
        name: "Dr. Matías Soto Velásquez",
        specialty: "Psiquiatría",
        image: "assets/img/doctors/doctor10.jpg",
        rating: 4.6,
        education: "Universidad de los Andes, Especialización en Massachusetts General Hospital",
        experience: "12 años de experiencia",
        availability: "Martes a Sábado: 12:00 - 20:00",
        biography: "Especialista en psiquiatría adulto con formación adicional en trastornos del ánimo y ansiedad. Coordinador del programa de salud mental integrado de SaludPlus y promotor de la destigmatización de las enfermedades psiquiátricas.",
        phoneNumber: "+56 9 9876 5432",
        email: "matias.soto@saludplus.com",
        consultationFee: 85000,
        isOnCall: false,
        department: "Psiquiatría",
        license: "MC-01234"
      },
      {
        id: 11,
        name: "Dra. Javiera Cornejo Lizana",
        specialty: "Oftalmología",
        image: "assets/img/doctors/doctor11.jpg",
        rating: 4.8,
        education: "Universidad Católica, Fellow en Bascom Palmer Eye Institute",
        experience: "10 años de experiencia",
        availability: "Lunes, Miércoles y Viernes: 8:00 - 16:00",
        biography: "Especialista en cirugía refractiva y cataratas. Experta en técnicas mínimamente invasivas y tratamientos láser para corrección visual. Participa regularmente en misiones médicas internacionales.",
        phoneNumber: "+56 9 8765 4321",
        email: "javiera.cornejo@saludplus.com",
        consultationFee: 90000,
        isOnCall: true,
        department: "Oftalmología",
        license: "MC-12340"
      },
      {
        id: 12,
        name: "Dr. Ignacio Vera Palacios",
        specialty: "Medicina Interna",
        image: "assets/img/doctors/doctor12.jpg",
        rating: 4.7,
        education: "Universidad de Concepción, Especialización en Mayo Clinic",
        experience: "19 años de experiencia",
        availability: "Lunes a Jueves: 8:00 - 14:00",
        biography: "Internista con amplia experiencia en manejo de pacientes complejos y pluripatológicos. Director del programa de hospitalización domiciliaria de SaludPlus y especialista en medicina geriátrica.",
        phoneNumber: "+56 9 7654 3210",
        email: "ignacio.vera@saludplus.com",
        consultationFee: 95000,
        isOnCall: false,
        department: "Medicina Interna",
        license: "MC-23401"
      },
      {
        id: 13,
        name: "Dra. Catalina Pinto Rodríguez",
        specialty: "Medicina General",
        image: "assets/img/doctors/doctor13.jpg",
        rating: 4.9,
        education: "Universidad de Santiago, Diplomada en Medicina Familiar",
        experience: "7 años de experiencia",
        availability: "Martes a Sábado: 9:00 - 17:00",
        biography: "Médico de familia con enfoque en medicina preventiva y promoción de la salud. Coordina el programa de control de enfermedades crónicas de SaludPlus con especial atención a la educación del paciente.",
        phoneNumber: "+56 9 6543 2109",
        email: "catalina.pinto@saludplus.com",
        consultationFee: 65000,
        isOnCall: true,
        department: "Medicina General",
        license: "MC-34012"
      },
      {
        id: 14,
        name: "Dr. Gabriel Leiva Muñoz",
        specialty: "Urología",
        image: "assets/img/doctors/doctor14.jpg",
        rating: 4.7,
        education: "Universidad de Chile, Fellowship en Memorial Sloan Kettering",
        experience: "13 años de experiencia",
        availability: "Lunes, Miércoles y Viernes: 13:00 - 19:00",
        biography: "Especialista en urología oncológica y cirugía robótica. Pionero en técnicas mínimamente invasivas para el tratamiento del cáncer de próstata y riñón en Chile.",
        phoneNumber: "+56 9 5432 1098",
        email: "gabriel.leiva@saludplus.com",
        consultationFee: 105000,
        isOnCall: false,
        department: "Urología",
        license: "MC-45123"
      },
      {
        id: 15,
        name: "Dra. Francisca Herrera Valenzuela",
        specialty: "Pediatría",
        image: "assets/img/doctors/doctor15.jpg",
        rating: 4.8,
        education: "Universidad Católica, Especialización en Hospital Sant Joan de Déu, Barcelona",
        experience: "9 años de experiencia",
        availability: "Martes a Sábado: 8:00 - 16:00",
        biography: "Pediatra especializada en neonatología y cuidados intensivos pediátricos. Promotora de la lactancia materna y del desarrollo infantil temprano. Coordina el programa de seguimiento de prematuros de SaludPlus.",
        phoneNumber: "+56 9 4321 0987",
        email: "francisca.herrera@saludplus.com",
        consultationFee: 85000,
        isOnCall: true,
        department: "Neonatología",
        license: "MC-56234"
      }
    ];
  }
}