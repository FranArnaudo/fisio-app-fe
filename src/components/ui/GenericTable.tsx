type GenericTableProps<T> = {
  items: T[];
  columns: { name: string; key: keyof T }[];
  lastColumn?: (item: T) => JSX.Element;
};
const GenericTable: <T>(props: GenericTableProps<T>) => JSX.Element = ({
  items,
  columns,
  lastColumn,
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
              <th className="py-3 px-2 font-medium text-gray-700 dark:text-gray-300"></th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-600 text-gray-700 dark:text-gray-300">
          {items.map((item: any) => (
            <tr
              key={item.id}
              className="text-center hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {columns.map((column) => (
                <td className="py-2 px-2">
                  {typeof item[column.key] === "boolean"
                    ? item[column.key]
                      ? "Si"
                      : "No"
                    : item[column.key]}
                </td>
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
