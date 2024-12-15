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
};

export type Center = {
  name: string;
  address: string;
  phone: string;
  id: string;
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
