export interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  reason?: string;
  priority?: string;
  notes?: string;
  specialty?: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
}