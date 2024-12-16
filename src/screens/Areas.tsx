import AddAreaModal from "@/components/areas/AddAreaModal";
import Button from "@/components/ui/Button";
import GenericTable from "@/components/ui/GenericTable";
import Pagination from "@/components/ui/Pagination";
import TextInput from "@/components/ui/TextInput";
import useFetch from "@/lib/hooks/useFetch";
import usePagination from "@/lib/hooks/usePagination";
import { Area, PaginationParams } from "@/types";

const Areas = () => {
  const getAreasWithPagination = ({
    page,
    limit,
    search,
    filters,
  }: PaginationParams) => {
    const filtersQuery = Object.entries(filters)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return fetchData(
      `/areas?page=${page}&limit=${limit}&name=${search}${
        filtersQuery ? "&" + filtersQuery : ""
      }`,
      "GET"
    );
  };
  const { fetchData } = useFetch();
  const {
    data: areas,
    goToPage,
    totalPages,
    currentPage,
    setItemsPerPage,
    itemsPerPage,
    applySearch,
    refetch,
  } = usePagination(getAreasWithPagination);
  let timeoutId: number | null = null;

  const debouncedApplySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      applySearch(e.target.value);
      timeoutId = null;
    }, 1000);
  };
  const handleToggle = async (id: string) => {
    await fetchData(`/areas/${id}/toggle`, "PATCH");
    refetch();
  };
  return (
    <div className="grid grid-cols-12 h-full bg-background text-foreground">
      <div className="col-span-12 md:col-span-8 h-full px-4 py-6 md:px-8 overflow-auto">
        <div className="">
          <h1 className="text-2xl font-bold mb-6">Áreas</h1>
          <div className="flex justify-between gap-4 mb-6">
            <div className="flex gap-4 flex-1">
              <TextInput
                placeholder="Buscar área..."
                onChange={debouncedApplySearch}
              />
            </div>
            <AddAreaModal refetch={refetch} />
          </div>
          <div className="bg-white border border-gray-300 rounded-md shadow-sm overflow-hidden">
            <GenericTable
              items={areas}
              columns={[
                { name: "Nombre", key: "name" },
                { name: "Activo", key: "active" },
              ]}
              lastColumn={(item: Area) => (
                <td className="py-2 px-2 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => handleToggle(item.id)}
                  >
                    {item.active ? "Desactivar" : "Activar"}
                  </Button>
                </td>
              )}
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

export default Areas;
