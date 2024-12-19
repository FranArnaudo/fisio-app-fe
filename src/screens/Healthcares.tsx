import AddHealthcareModal from "@/components/healthcares/AddHealthcareModal";
import HealthcareSidebar from "@/components/healthcares/HealthcareSidebar";
import Button from "@/components/ui/Button";
import GenericTable from "@/components/ui/GenericTable";
import Pagination from "@/components/ui/Pagination";
import TextInput from "@/components/ui/TextInput";
import useFetch from "@/lib/hooks/useFetch";
import usePagination from "@/lib/hooks/usePagination";
import { Healthcare, PaginationParams } from "@/types";
import { useState } from "react";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";

const Healthcares = () => {
  const [selectedHealthcare, setSelectedHealthcare] = useState<string | null>(
    null
  );
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
  const handleRowClick = (healthcare: Healthcare) => {
    setSelectedHealthcare(healthcare.id);
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
            <AddHealthcareModal refetch={refetch} />
          </div>
          <div className="bg-white border border-gray-300 rounded-md shadow-sm overflow-hidden">
            <GenericTable
              items={[...healthcares]}
              onRowClick={handleRowClick}
              columns={[
                { name: "Nombre", key: "name" },
                { name: "Activo", key: "active" },
              ]}
              lastColumn={(item) => (
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
      <div
        className={`${
          selectedHealthcare
            ? "translate-y-0 absolute"
            : "translate-y-full absolute sm:translate-y-0"
        }  z-0 md:flex md:col-span-4 h-full bg-white border-l border-gray-300 px-4 py-6 md:px-6 fixed bottom-0 left-0 w-full md:static md:w-auto transition-transform duration-300 ease-in-out`}
      >
        <div className="w-full">
          {selectedHealthcare ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setSelectedHealthcare(null)}
                iconStart={<MdKeyboardDoubleArrowDown />}
              ></Button>
              <HealthcareSidebar id={selectedHealthcare} />
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Seleccione una obra social
              </h2>
              <p className="text-sm text-gray-600">
                Selecciona una obra social para ver los servicios asociados,
                cobertura y co-seguro
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Healthcares;
