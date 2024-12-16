import AddHealthcareModal from "@/components/healthcares/AddHealthcareModal";
import HealthcaresTable from "@/components/healthcares/HealthcaresTable";
import Pagination from "@/components/ui/Pagination";
import TextInput from "@/components/ui/TextInput";
import useFetch from "@/lib/hooks/useFetch";
import usePagination from "@/lib/hooks/usePagination";
import { PaginationParams } from "@/types";

const Healthcares = () => {
  const getHealthcaresWithPagination = ({
    page,
    limit,
    search,
    filters,
  }: PaginationParams) => {
    const filtersQuery = Object.entries(filters)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return fetchData(
      `/healthcare?page=${page}&limit=${limit}&name=${search}${
        filtersQuery ? "&" + filtersQuery : ""
      }`,
      "GET"
    );
  };
  const { fetchData } = useFetch();
  const {
    data: healthcares,
    goToPage,
    totalPages,
    currentPage,
    setItemsPerPage,
    itemsPerPage,
    applySearch,
    refetch,
  } = usePagination(getHealthcaresWithPagination);
  let timeoutId: number | null = null;

  const debouncedApplySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      applySearch(e.target.value);
      timeoutId = null;
    }, 1000);
  };
  const handleToggle = async (id: string) => {
    await fetchData(`/healthcare/${id}/toggle`, "PATCH");
    refetch();
  };
  return (
    <div className="grid grid-cols-12 h-full bg-background text-foreground">
      <div className="col-span-12 md:col-span-8 h-full px-4 py-6 md:px-8 overflow-auto">
        <div className="">
          <h1 className="text-2xl font-bold mb-6">Obras sociales</h1>

          <div className="flex justify-between gap-4 mb-6">
            <div className="flex gap-4 flex-1">
              <TextInput
                placeholder="Buscar obra social..."
                onChange={debouncedApplySearch}
              />
            </div>
            <AddHealthcareModal />
          </div>
          <div className="bg-white border border-gray-300 rounded-md shadow-sm overflow-hidden">
            <HealthcaresTable
              healthcares={[...healthcares]}
              handleToggle={handleToggle}
            />
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
      <div className="hidden md:flex md:col-span-4 h-full bg-white border-l border-gray-300 px-4 py-6 md:px-6">
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

export default Healthcares;
