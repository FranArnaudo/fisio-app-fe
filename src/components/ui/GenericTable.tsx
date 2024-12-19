import { getNestedValue } from "@/lib/utils";

type GenericTableProps<T> = {
  items: T[];
  columns: { name: string; key: keyof T; prefix?: string; suffix?: string }[];
  lastColumnName?: string;
  onRowClick?: (item: T) => void;
  lastColumn?: (item: T) => JSX.Element;
};
const getColumnValue = (item: any, column: any) => {
  let val = getNestedValue(item, column.key as string);
  if (!val) {
    return "-";
  }
  if (typeof val === "boolean") {
    return val ? "Si" : "No";
  }
  if (column.prefix) {
    val = column.prefix + val;
  }
  if (column.suffix) {
    val = val + column.suffix;
  }
  return val;
};
const GenericTable: <T>(props: GenericTableProps<T>) => JSX.Element = ({
  items,
  columns,
  onRowClick = () => {},
  lastColumn,
  lastColumnName,
}) => {
  return (
    <div className="w-full border border-gray-300 rounded-md overflow-hidden">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr className="text-center">
            {columns.map((header) => (
              <th className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                {header.name}
              </th>
            ))}
            {lastColumn && (
              <th className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                {lastColumnName ? lastColumnName : null}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600 text-gray-700 dark:text-gray-300">
          {items.map((item: any) => (
            <tr
              key={item.id}
              className="text-center hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => onRowClick(item)}
            >
              {columns.map((column) => (
                <td className="py-2 px-2">{getColumnValue(item, column)}</td>
              ))}
              {lastColumn && lastColumn(item)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GenericTable;
