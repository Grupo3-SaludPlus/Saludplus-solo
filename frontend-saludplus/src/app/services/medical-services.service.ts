import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface MedicalService {
  id: number;
  name: string;
  description: string;
  category: string;
  image?: string;
  duration?: string;
  price?: number;
  requiresAppointment: boolean;
  availableOnline: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MedicalServicesService {
  private localStorageKey = 'saludplus_services';
  private servicesSubject = new BehaviorSubject<MedicalService[]>(this.loadServices());
  private isBrowser: boolean;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  getServices(): Observable<MedicalService[]> {
    return this.servicesSubject.asObservable();
  }
  
  getAllServices(): MedicalService[] {
    return this.servicesSubject.getValue();
  }
  
  private loadServices(): MedicalService[] {
    if (this.isBrowser) {
      try {
        const storedServices = localStorage.getItem(this.localStorageKey);
        if (storedServices) {
          return JSON.parse(storedServices);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }
    return this.getDefaultServices();
  }
  
  private getDefaultServices(): MedicalService[] {
    return [
      {
        id: 1,
        name: "Consulta Médica General",
        description: "Evaluación integral del estado de salud del paciente, enfocada en el diagnóstico, tratamiento y prevención de enfermedades comunes.",
        category: "Consultas",
        duration: "30 minutos",
        price: 45000,
        requiresAppointment: true,
        availableOnline: true,
        image: "assets/img/services/consulta-general.jpg"
      },
      {
        id: 2,
        name: "Consulta Especialista",
        description: "Atención médica enfocada en áreas específicas de la medicina con profesionales altamente especializados.",
        category: "Consultas",
        duration: "45 minutos",
        price: 85000,
        requiresAppointment: true,
        availableOnline: true,
        image: "assets/img/services/consulta-especialista.jpg"
      },
      {
        id: 3,
        name: "Exámenes de Laboratorio",
        description: "Análisis clínicos que ayudan a diagnosticar, tratar y prevenir enfermedades mediante muestras de sangre, orina y otros fluidos corporales.",
        category: "Diagnóstico",
        requiresAppointment: false,
        availableOnline: false,
        image: "assets/img/services/examenes-laboratorio.jpg"
      },
      {
        id: 4,
        name: "Imagenología",
        description: "Servicios de diagnóstico por imágenes que incluyen radiografías, ecografías, tomografías computarizadas y resonancias magnéticas.",
        category: "Diagnóstico",
        requiresAppointment: true,
        availableOnline: false,
        image: "assets/img/services/imagenologia.jpg"
      },
      {
        id: 5,
        name: "Urgencias 24/7",
        description: "Atención inmediata para situaciones médicas que requieren tratamiento inmediato, disponible las 24 horas, todos los días.",
        category: "Urgencias",
        requiresAppointment: false,
        availableOnline: false,
        image: "assets/img/services/urgencias.jpg"
      },
      {
        id: 6,
        name: "Cirugía Ambulatoria",
        description: "Procedimientos quirúrgicos que no requieren hospitalización, permitiendo que el paciente regrese a casa el mismo día.",
        category: "Cirugía",
        requiresAppointment: true,
        availableOnline: false,
        image: "assets/img/services/cirugia-ambulatoria.jpg"
      },
      {
        id: 7,
        name: "Hospitalización",
        description: "Internación para pacientes que requieren atención médica continua y monitoreo durante su recuperación.",
        category: "Hospitalización",
        requiresAppointment: true,
        availableOnline: false,
        image: "assets/img/services/hospitalizacion.jpg"
      },
      {
        id: 8,
        name: "Fisioterapia",
        description: "Rehabilitación física para recuperar movilidad y funcionalidad después de lesiones, cirugías o condiciones médicas.",
        category: "Rehabilitación",
        duration: "60 minutos",
        price: 55000,
        requiresAppointment: true,
        availableOnline: false,
        image: "assets/img/services/fisioterapia.jpg"
      },
      {
        id: 9,
        name: "Telemedicina",
        description: "Consultas médicas virtuales que permiten recibir atención profesional desde la comodidad del hogar.",
        category: "Consultas",
        duration: "30 minutos",
        price: 40000,
        requiresAppointment: true,
        availableOnline: true,
        image: "assets/img/services/telemedicina.jpg"
      },
      {
        id: 10,
        name: "Chequeo Médico Ejecutivo",
        description: "Evaluación médica completa que incluye exámenes preventivos para detectar tempranamente factores de riesgo para la salud.",
        category: "Prevención",
        duration: "120 minutos",
        price: 250000,
        requiresAppointment: true,
        availableOnline: false,
        image: "assets/img/services/chequeo-ejecutivo.jpg"
      },
      {
        id: 11,
        name: "Salud Mental",
        description: "Atención psicológica y psiquiátrica para el tratamiento de trastornos emocionales, conductuales y mentales.",
        category: "Consultas",
        duration: "60 minutos",
        price: 75000,
        requiresAppointment: true,
        availableOnline: true,
        image: "assets/img/services/salud-mental.jpg"
      },
      {
        id: 12,
        name: "Pediatría Integral",
        description: "Atención especializada en el desarrollo y salud de niños y adolescentes, desde recién nacidos hasta los 18 años.",
        category: "Consultas",
        duration: "40 minutos",
        price: 65000,
        requiresAppointment: true,
        availableOnline: true,
        image: "assets/img/services/pediatria.jpg"
      },
      {
        id: 13,
        name: "Vacunación",
        description: "Administración de vacunas para prevenir enfermedades infecciosas según el calendario de vacunación o necesidades específicas.",
        category: "Prevención",
        requiresAppointment: false,
        availableOnline: false,
        image: "assets/img/services/vacunacion.jpg"
      },
      {
        id: 14,
        name: "Medicina Estética",
        description: "Procedimientos no quirúrgicos para mejorar la apariencia física y tratar problemas estéticos.",
        category: "Estética",
        requiresAppointment: true,
        availableOnline: false,
        image: "assets/img/services/medicina-estetica.jpg"
      },
      {
        id: 15,
        name: "Nutrición y Dietética",
        description: "Evaluación nutricional y elaboración de planes de alimentación personalizados para mejorar la salud o manejar condiciones médicas.",
        category: "Prevención",
        duration: "50 minutos",
        price: 50000,
        requiresAppointment: true,
        availableOnline: true,
        image: "assets/img/services/nutricion.jpg"
      },
      {
        id: 16,
        name: "Dental General",
        description: "Servicios odontológicos para el diagnóstico, tratamiento y prevención de problemas bucales y dentales.",
        category: "Odontología",
        requiresAppointment: true,
        availableOnline: false,
        image: "assets/img/services/dental.jpg"
      },
      {
        id: 17,
        name: "Kinesiología",
        description: "Tratamiento mediante movimiento, ejercicio terapéutico y agentes físicos para recuperar la función motora.",
        category: "Rehabilitación",
        duration: "60 minutos",
        price: 48000,
        requiresAppointment: true,
        availableOnline: false,
        image: "assets/img/services/kinesiologia.jpg"
      },
      {
        id: 18,
        name: "Maternidad y Parto",
        description: "Atención integral durante el embarazo, parto y posparto, incluyendo controles prenatales y servicios de neonatología.",
        category: "Especialidades",
        requiresAppointment: true,
        availableOnline: false,
        image: "assets/img/services/maternidad.jpg"
      }
    ];
  }
  
  // Métodos para gestionar servicios (agregar, actualizar, eliminar)
  addService(service: MedicalService): void {
    const services = this.getAllServices();
    const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
    service.id = newId;
    services.push(service);
    this.saveServices(services);
  }
  
  updateService(service: MedicalService): void {
    const services = this.getAllServices();
    const index = services.findIndex(s => s.id === service.id);
    if (index !== -1) {
      services[index] = service;
      this.saveServices(services);
    }
  }
  
  deleteService(id: number): void {
    const services = this.getAllServices().filter(s => s.id !== id);
    this.saveServices(services);
  }
  
  private saveServices(services: MedicalService[]): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.localStorageKey, JSON.stringify(services));
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    }
    this.servicesSubject.next(services);
  }
}