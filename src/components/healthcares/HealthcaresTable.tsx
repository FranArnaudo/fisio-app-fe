import { Healthcare } from "@/types";
import Button from "../ui/Button";

type HealthcaresTableProps = {
  healthcares: Healthcare[];
  handleToggle: (id: string) => void;
};
const HealthcaresTable = ({
  healthcares,
  handleToggle,
}: HealthcaresTableProps) => {
  return (
    <div className="w-full border border-gray-300 rounded-md overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr className="text-center">
            <th className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
              Nombre
            </th>
            <th className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
              Activo
            </th>
            <th className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600 text-gray-700 dark:text-gray-300">
          {healthcares.map((healthcare) => (
            <tr
              key={healthcare.id}
              className="text-center hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="py-2 px-2">{healthcare.name}</td>
              <td className="py-2 px-2">{healthcare.active ? "Si" : "No"}</td>
              <td className="py-2 px-2 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => handleToggle(healthcare.id)}
                >
                  {healthcare.active ? "Desactivar" : "Activar"}
                </Button>
              </td>
            </tr>
          ))}
          {/* Additional rows can go here */}
        </tbody>
      </table>
    </div>
  );
};

export default HealthcaresTable;
