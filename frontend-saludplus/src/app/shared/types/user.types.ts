export interface User {
  id: number | string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  birthdate?: string;
  gender?: 'M' | 'F' | 'O';
  bloodType?: string;
  allergies?: string[];
  chronic?: string[];
  emergencyContact?: string;
  createdAt?: string;
  specialty?: string;
}

export interface PatientProfile extends User {
  role: 'patient';
  medicalHistory?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface DoctorProfile extends User {
  role: 'doctor';
  specialty: string;
  licenseNumber?: string;
  experienceYears?: number;
}

export interface AdminProfile extends User {
  role: 'admin';
  permissions?: string[];
  lastLogin?: string;
}