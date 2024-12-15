import { BsThreeDotsVertical } from "react-icons/bs";
import IconButton from "../ui/IconButton";
import { Patient } from "@/types";
import { getAge } from "@/lib/utils";
import dayjs from "dayjs";

type PatientsTableProps = {
  patients: Patient[];
};
const PatientsTable = ({ patients }: PatientsTableProps) => {
  return (
    <div className="w-full border border-gray-300 rounded-md overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr className="text-center">
            <th className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
              Nombre
            </th>
            <th className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
              Edad
            </th>
            <th className="hidden sm:table-cell py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
              Teléfono
            </th>
            <th className="hidden sm:table-cell py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
              Fecha de registro
            </th>
            <th className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600 text-gray-700 dark:text-gray-300">
          {patients.map((patient) => (
            <tr
              key={patient.id}
              className="text-center hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="py-2 px-2">
                {patient.firstname} {patient.lastname}
              </td>
              <td className="py-2 px-2">
                {getAge(new Date(patient.dateOfBirth))}
              </td>
              <td className="hidden sm:table-cell py-2 px-2">
                {patient.phone}
              </td>
              <td className="hidden sm:table-cell py-2 px-2">
                {dayjs(patient.registerDate).format("DD/MM/YYYY")}
              </td>
              <td className="py-2 px-2">
                <IconButton noBackground>
                  <BsThreeDotsVertical className="text-primary" />
                </IconButton>
              </td>
            </tr>
          ))}
          {/* Additional rows can go here */}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsTable;
