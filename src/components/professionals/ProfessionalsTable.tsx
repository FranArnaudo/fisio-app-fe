import React from "react";
import { Professional } from "@/types";
import { UserCircle, Briefcase } from "lucide-react";
import Button from "../ui/Button";
import { PiPencil } from "react-icons/pi";
import { BsTrash } from "react-icons/bs";

type ProfessionalsTableProps = {
  professionals: Professional[];
  onSelectRow: (professional: Professional) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const ProfessionalsTable: React.FC<ProfessionalsTableProps> = ({
  professionals,
  onSelectRow,
  onEdit,
  onDelete
}) => {
  return (
    <table className="w-full border-collapse text-sm">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="py-3 px-4 font-medium text-left text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
              <UserCircle className="h-4 w-4 mr-2 text-gray-500" />
              <span>Nombre completo</span>
            </div>
          </th>
          <th className="py-3 px-4 font-medium text-left text-gray-700 dark:text-gray-300 hidden sm:table-cell">
            <span>Usuario</span>
          </th>
          <th className="py-3 px-4 font-medium text-left text-gray-700 dark:text-gray-300 hidden md:table-cell">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
              <span>Área</span>
            </div>
          </th>
          <th className="py-3 px-4 font-medium text-center text-gray-700 dark:text-gray-300 w-16">
            <span>Color</span>
          </th>
          <th className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-right font-medium text-gray-600">
            <span className="sr-only">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-600 text-gray-700 dark:text-gray-300">
        {professionals.length > 0 ? (
          professionals.map((professional) => (
            <tr
              key={professional.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
              onClick={() => onSelectRow(professional)}
            >
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-medium mr-3">
                    {professional.firstname?.[0] || "?"}
                    {professional.lastname?.[0] || "?"}
                  </div>
                  <div>
                    <div className="font-medium">
                      {professional.firstname} {professional.lastname}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 md:hidden">
                      @{professional.username}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 hidden sm:table-cell">
                @{professional.username}
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                {professional.area?.name || "—"}
              </td>
              <td className="py-3 px-4 text-center">
                <div className="relative flex items-center justify-center">
                  <div
                    className="h-8 w-8 rounded-full border border-gray-200 shadow-sm"
                    style={{
                      backgroundColor: professional.colorHex || "#CCCCCC",
                    }}
                    title={professional.colorHex || "No color"}
                  ></div>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Editar paciente"
                    onClick={e => {
                      e.stopPropagation()
                      onEdit(professional.id)
                    }}
                  >
                    <PiPencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive-outline"
                    size="icon"
                    aria-label="Eliminar paciente"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(professional.id)

                    }}
                  >
                    <BsTrash className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4} className="py-8 text-center text-gray-500">
              No se encontraron profesionales
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export { ProfessionalsTable };