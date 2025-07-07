export interface Appointment {
  id?: number;
  patient_id: number;
  doctor_id: number;
  patient_name: string;
  doctor_name: string;
  // Propiedades adicionales que requiere la otra versión:
  specialty?: string;
  created_at?: string;
  //
  doctorSpecialty: string;
  date: string;
  time: string;
  reason: string;
  priority: string;
  status: string;
  notes?: string;
  location?: string;
}