import React from 'react';
import { User, Calendar, Phone, Mail, CreditCard } from 'lucide-react';
import { Patient } from '@/types';
import { getAge } from '@/lib/utils';
import dayjs from 'dayjs';

interface PatientDrawerHeaderProps {
  patient: Patient | null;
  isLoading?: boolean;
}

const PatientDrawerHeader: React.FC<PatientDrawerHeaderProps> = ({ patient, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex gap-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const patientAge = patient.dateOfBirth ? getAge(new Date(patient.dateOfBirth)) : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex items-start gap-4">
        {/* Patient avatar/initial */}
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold">
          {patient.firstname[0]?.toUpperCase()}
        </div>

        {/* Patient details */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <User className="w-4 h-4 mr-1 text-primary" />
            {patient.firstname} {patient.lastname}
          </h3>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-sm">
            {patientAge !== null && (
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                <span>{patientAge} años</span>
              </div>
            )}

            {patient.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-1 text-gray-400" />
                <span>{patient.phone}</span>
              </div>
            )}

            {patient.email && (
              <div className="flex items-center text-gray-600 overflow-hidden text-ellipsis">
                <Mail className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                <span className="truncate">{patient.email}</span>
              </div>
            )}

            {patient.dni && (
              <div className="flex items-center text-gray-600">
                <CreditCard className="w-4 h-4 mr-1 text-gray-400" />
                <span>DNI: {patient.dni}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration date */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
        Paciente registrado el {dayjs(patient.registerDate).format('DD/MM/YYYY')}
      </div>
    </div>
  );
};

export default PatientDrawerHeader;