export interface ExtendedUser {
  id: number | string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  profile?: any;
  phone?: string;
  birthdate?: string;
  gender?: 'M' | 'F' | 'O';
  bloodType?: string;
  allergies?: string[];
  chronic?: string[];
  emergencyContact?: string;
  createdAt?: string;
  specialty?: string;
  dateOfBirth?: string; // Para compatibilidad
}

export interface PatientProfile extends ExtendedUser {
  role: 'patient';
  medicalHistory?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface DoctorProfile extends ExtendedUser {
  role: 'doctor';
  specialty: string;
  licenseNumber?: string;
  experienceYears?: number;
}

export interface AdminProfile extends ExtendedUser {
  role: 'admin';
  permissions?: string[];
  lastLogin?: string;
}