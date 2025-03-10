import React from 'react';
import { BsThreeDotsVertical } from "react-icons/bs";
import IconButton from "../ui/IconButton";
import { Patient } from "@/types";
import { getAge } from "@/lib/utils";
import dayjs from "dayjs";
import { DrawerTrigger } from "../ui/drawer";
import { Calendar, Phone, User, Clock } from 'lucide-react';

type PatientsTableProps = {
  patients: Patient[];
  onSelectRow: (id: string) => void;
};

const PatientsTable = ({ patients, onSelectRow }: PatientsTableProps) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span>Nombre</span>
                </div>
              </th>
              <th className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Edad</span>
                </div>
              </th>
              <th className="hidden border-b border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium text-gray-600 sm:table-cell">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span>Teléfono</span>
                </div>
              </th>
              <th className="hidden border-b border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium text-gray-600 sm:table-cell">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Fecha de registro</span>
                </div>
              </th>
              <th className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-right font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {patients.map((patient) => (
              <DrawerTrigger key={patient.id} asChild>
                <tr
                  className="transition-colors hover:bg-gray-50"
                  onClick={() => onSelectRow(patient.id)}
                >
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {patient.firstname} {patient.lastname}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {getAge(new Date(patient.dateOfBirth))}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
                    {patient.phone}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
                    {dayjs(patient.registerDate).format("DD/MM/YYYY")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <IconButton noBackground>
                      <BsThreeDotsVertical className="text-gray-400 hover:text-primary" />
                    </IconButton>
                  </td>
                </tr>
              </DrawerTrigger>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No hay pacientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientsTable;