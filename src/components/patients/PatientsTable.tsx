import React, { useState } from 'react';
import { BsTrash } from "react-icons/bs";
import { Patient } from "@/types";
import { getAge } from "@/lib/utils";
import dayjs from "dayjs";
import { DrawerTrigger } from "../ui/drawer";
import { Calendar, Phone, User } from 'lucide-react';
import { PiPencil } from 'react-icons/pi';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

type PatientsTableProps = {
  patients: Patient[];
  onSelectRow: (id: string) => void;
  onDelete?: (id: string) => void;
};

const PatientsTable = ({ patients, onSelectRow, onDelete }: PatientsTableProps) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    setPatientToDelete(patient);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (patientToDelete && onDelete) {
      onDelete(patientToDelete.id);
    }
    setDeleteModalOpen(false);
    setPatientToDelete(null);
  };

  return (
    <>
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
                <th className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-right font-medium text-gray-600">
                  <span className="sr-only">Acciones</span>
                </th>
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
                      {patient.dateOfBirth ? getAge(new Date(patient.dateOfBirth)) : '-'}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
                      {patient.phone || '-'}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
                      {dayjs(patient.registerDate).format("DD/MM/YYYY")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Editar paciente"
                        >
                          <PiPencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive-outline"
                          size="icon"
                          aria-label="Eliminar paciente"
                          onClick={(e) => handleDeleteClick(e, patient)}
                        >
                          <BsTrash className="h-4 w-4" />
                        </Button>
                      </div>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Eliminar paciente"
      >
        <div className="p-1">
          <p className="mb-6 text-gray-700">
            ¿Está seguro de que desea eliminar a <span className="font-medium text-gray-900">
              {patientToDelete?.firstname} {patientToDelete?.lastname}
            </span>? Esta acción no se puede deshacer.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="secondary"
              className="w-full sm:w-1/2"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-1/2"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PatientsTable;