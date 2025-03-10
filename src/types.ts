/*Component and dev stuff*/
export type Option<T> = {
  value: T;
  text: string;
  id: string;
};

/* Patient related types */
export type Patient = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  dateOfBirth: string; // Format: YYYY-MM-DD
  phone: string;
  registerDate: string;
};

export type Area = {
  id: string;
  name: string;
  active: boolean;
};

export type Center = {
  name: string;
  address: string;
  phone: string;
  id: string;
};

export type Healthcare = {
  id: string;
  name: string;
  active: boolean;
};
export type Professional = {
  id: string;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
};

export type Appointment = {
  id: string;
  patient: Partial<Patient>;
  professional: Partial<Professional>;
  appointmentDatetime: Date;
  status: string;
  notes?: string;
  createdAt: Date;
  duration: number; // in minutes
};

export type AppointmentRange = { start: Date; end: Date };

export type PaginationParams = {
  page: number;
  limit: number;
  search: string;
  filters: Record<string, any>;
};

export type Order = {
  id: string;
  url?: string;
  notes?: string;
  status: string; // 'Generada', 'Presentado', 'Expired'
  submittedAt?: Date;
  patient: {
    id: string;
    firstname: string;
    lastname: string;
  };
  healthcare?: {
    id: string;
    name: string;
  };
  service: {
    id: string;
    name: string;
    price: number;
  };
  area?: {
    id: string;
    name: string;
  };
  appointments?: Array<{
    id: string;
    appointmentDatetime: Date;
  }>;
  createdAt: Date;
  expiresAt?: Date;
}
