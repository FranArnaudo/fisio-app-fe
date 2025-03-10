import { Healthcare } from "@/types";
import Button from "../ui/Button";
import { Building2, FileText, CheckCircle, XCircle } from "lucide-react";

type HealthcaresTableProps = {
  healthcares: Healthcare[];
  handleToggle: (id: string) => void;
  onSelectRow?: (healthcare: Healthcare) => void;
};

const HealthcaresTable = ({
  healthcares,
  handleToggle,
  onSelectRow,
}: HealthcaresTableProps) => {
  return (
    <div className="w-full border border-gray-300 rounded-md overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="py-3 px-4 font-medium text-left text-gray-700 dark:text-gray-300">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                <span>Nombre</span>
              </div>
            </th>
            <th className="py-3 px-4 font-medium text-left text-gray-700 dark:text-gray-300">
              <div className="flex items-center">
                <span>Estado</span>
              </div>
            </th>
            <th className="py-3 px-4 text-right font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center justify-end">
                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                <span>Órdenes</span>
              </div>
            </th>
            <th className="py-3 px-4 text-right font-medium text-gray-700 dark:text-gray-300">
              <span>Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600 text-gray-700 dark:text-gray-300">
          {healthcares.map((healthcare) => (
            <tr
              key={healthcare.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => onSelectRow && onSelectRow(healthcare)}
            >
              <td className="py-3 px-4 font-medium">
                {healthcare.name}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center">
                  {healthcare.active ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Activa</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-500">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span>Inactiva</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                {/* This would show the order count when we have that data */}
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1"></span>
                  Ver órdenes
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(healthcare.id);
                    }}
                  >
                    {healthcare.active ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {healthcares.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-500">
                No se encontraron obras sociales
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HealthcaresTable;