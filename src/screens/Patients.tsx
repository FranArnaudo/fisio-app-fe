import PatientsTable from "@/components/patients/PatientsTable";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import TextInput from "@/components/ui/TextInput";
import useFetch from "@/lib/hooks/useFetch";
import usePagination from "@/lib/hooks/usePagination";
import { BsSortAlphaDown } from "react-icons/bs";

const Patients = () => {
  type PaginationParams = {
    page: number;
    limit: number;
    search: string;
    filters: Record<string, any>;
  };

  const getPatientsWithPagination = ({
    page,
    limit,
    search,
    filters,
  }: PaginationParams) => {
    const filtersQuery = Object.entries(filters)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return fetchData(
      `/patients?page=${page}&limit=${limit}&name=${search}${
        filtersQuery ? "&" + filtersQuery : ""
      }`,
      "GET"
    );
  };
  const { fetchData } = useFetch();
  const {
    data: patients,
    goToPage,
    totalPages,
    currentPage,
    setItemsPerPage,
    itemsPerPage,
    applySearch,
  } = usePagination(getPatientsWithPagination);
  let timeoutId: number | null = null;

  const debouncedApplySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      applySearch(e.target.value);
      timeoutId = null;
    }, 1000);
  };
  return (
    <div className="grid grid-cols-12 h-full bg-background text-foreground">
      {/* Main Content Area */}
      <div className="col-span-12 md:col-span-8 h-full px-4 py-6 md:px-8 overflow-auto">
        <div className="">
          <h1 className="text-2xl font-bold mb-6">Pacientes</h1>

          <div className="flex justify-between gap-4 mb-6">
            <div className="flex gap-4 flex-1">
              <TextInput
                placeholder="Buscar paciente..."
                onChange={debouncedApplySearch}
              />
            </div>
            <div className="flex flex-1 justify-end gap-4">
              <div className="max-w-44 w-full">
                <Select
                  placeholder="Ordenar por"
                  options={[
                    { value: "name", text: "Nombre", id: "name" },
                    { value: "dateOfBirth", text: "Edad", id: "dateOfBirth" },
                    { value: "center", text: "Centro", id: "center" },
                  ]}
                  onChange={(option) => console.log(option)}
                />
              </div>
              <Button iconStart={<BsSortAlphaDown />} variant="primary" />
            </div>
          </div>

          {/* PatientsTable */}
          <div className="bg-white border border-gray-300 rounded-md shadow-sm overflow-hidden">
            <PatientsTable patients={[...patients]} />
          </div>
          <div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => goToPage(page)}
              onItemsPerPageChange={setItemsPerPage}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>
      </div>

      {/* Side Panel: can be a place for filters, stats, or additional info */}
      <div className="hidden md:flex md:col-span-4 h-full bg-white border-l border-gray-300 px-4 py-6 md:px-6">
        {/* Example content placeholder */}
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Detalles</h2>
          <p className="text-sm text-gray-600">
            Aquí se pueden mostrar estadísticas, detalles de selección u otra
            información relacionada con pacientes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Patients;
