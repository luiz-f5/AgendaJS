export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'medico' | 'paciente' | null;
  specialtyId?: number;
  specialty?: Specialty;
}

export interface Specialty {
  id: number;
  name: string;
}

export interface Notification {
  id: number;
  subject: string;
  message: string;
  scope: 'user' | 'medicos' | 'pacientes' | 'todos';
  senderName: string;
  targetUserId?: number;
  createdAt: string;
}

export interface Schedule {
  id: number;
  hour: string; 
  doctorId: number;
  doctor?: User;
}

export interface Appointment {
  id: number;
  status: 'agendada' | 'confirmada' | 'cancelada' | 'concluida';
  patientId: number;
  doctorId: number;
  date: string;
  hour: string;
  createdAt: string;
  doctor?: User;
  patient?: User;
}

export interface MedicalFile {
  id: number;
  filename: string;
  doctorId: number;
  patientId: number;
  createdAt: string;
  updatedAt: string;
  doctor?: User;
  patient?: User;
}