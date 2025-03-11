import { Service } from "@/types";
import { Tag, MapPin, DollarSign, ArrowUpDown } from "lucide-react";

type ServicesTableProps = {
  services: Service[];
  onSelectRow?: (service: Service) => void;
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
};

const ServicesTable = ({
  services,
  onSelectRow,
  onSort,
  sortField = 'name',
  sortOrder = 'ASC',
}: ServicesTableProps) => {
  // Handle sort click
  const handleSortClick = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    if (field === sortField) {
      return (
        <ArrowUpDown
          className={`h-4 w-4 ml-1 transition-transform ${sortOrder === 'DESC' ? 'rotate-180' : ''}`}
        />
      );
    }
    return null;
  };

  return (
    <div className="w-full border border-gray-200 rounded-md overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              className="py-3 px-4 font-medium text-left text-gray-700 dark:text-gray-300 cursor-pointer"
              onClick={() => handleSortClick('name')}
            >
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-gray-500" />
                <span>Nombre</span>
                {renderSortIndicator('name')}
              </div>
            </th>
            <th className="py-3 px-4 font-medium text-left text-gray-700 dark:text-gray-300">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>Área</span>
              </div>
            </th>
            <th
              className="py-3 px-4 font-medium text-right text-gray-700 dark:text-gray-300 cursor-pointer"
              onClick={() => handleSortClick('price')}
            >
              <div className="flex items-center justify-end">
                <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                <span>Precio</span>
                {renderSortIndicator('price')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600 text-gray-700 dark:text-gray-300">
          {services && services.length > 0 ? (
            services.map((service) => (
              <tr
                key={service.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => onSelectRow && onSelectRow(service)}
              >
                <td className="py-3 px-4 font-medium">
                  {service.name}
                  {service.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                      {service.description}
                    </p>
                  )}
                </td>
                <td className="py-3 px-4">
                  {service.area?.name ? (
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2"></span>
                      <span>{service.area.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No asignada</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-medium">
                  ${service.price?.toFixed(2) || '0.00'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="py-8 text-center text-gray-500">
                No se encontraron servicios
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ServicesTable;