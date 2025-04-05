import { useState, useCallback } from "react";
import { BsPlus } from "react-icons/bs";
import { Tag, MapPin, CreditCard } from "lucide-react";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import Pagination from "@/components/ui/Pagination";
import { DrawerContent, DrawerHeader, DrawerTitle, Drawer } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useFetch from "@/lib/hooks/useFetch";
import usePagination from "@/lib/hooks/usePagination";
import { Service, PaginationParams, Area } from "@/types";
import Modal from "@/components/ui/Modal";
import { toast } from "react-toastify";
import Select from "@/components/ui/Select";
import ServicesTable from "@/components/services/ServicesTable";
import AddServiceModal from "@/components/services/AddServiceModal";

const Services = () => {
  // State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [sortField, setSortField] = useState<string>('name');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('');

  // Hooks
  const { fetchData } = useFetch();

  // Fetch services list with pagination
  const getServicesWithPagination = useCallback(({
    page,
    limit,
    search,
    filters,
  }: PaginationParams) => {
    const filtersQuery = Object.entries(filters)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return fetchData(
      `/services?page=${page}&limit=${limit}&name=${search}&sort=${sortField}&order=${sortOrder}${filtersQuery ? "&" + filtersQuery : ""
      }`,
      "GET"
    );
  }, [fetchData, sortField, sortOrder]);

  const {
    data: services,
    goToPage,
    totalPages,
    currentPage,
    setItemsPerPage,
    itemsPerPage,
    applySearch,
    refetch,
  } = usePagination(getServicesWithPagination);

  // Load areas for filter
  const loadAreas = useCallback(async () => {
    try {
      const areasData = await fetchData('/areas/dropdown', 'GET');
      setAreas(areasData);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  }, []);

  // Handle service selection for drawer
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setIsDrawerOpen(true);
  };

  // Handle service deletion
  const handleDelete = async () => {
    if (!selectedService) return;

    try {
      await fetchData(`/services/${selectedService.id}`, 'DELETE');
      toast.success('Servicio eliminado con éxito');
      setIsDeleteModalOpen(false);
      setIsDrawerOpen(false);
      refetch();
    } catch (error) {
      toast.error('Error al eliminar el servicio');
    }
  };

  // Reset selection when drawer closes
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedService(null);
    }, 300);
  };

  // Toggle sort order
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortOrder('ASC');
    }
  };

  // Apply area filter
  const handleAreaFilter = (areaId: string) => {
    setSelectedAreaFilter(areaId);
    // Implement filter logic through your pagination hook or fetch data again
  };

  // Search debounce handling
  let timeoutId: number | null = null;
  const debouncedApplySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      applySearch(e.target.value);
      timeoutId = null;
    }, 500);
  };

  // Load areas on component mount
  useState(() => {
    loadAreas();
  });

  // Map areas to select options
  const areaOptions = [
    { id: '', value: '', text: 'Todas las áreas' },
    ...(areas?.map(area => ({
      id: area.id,
      value: area.id,
      text: area.name,
    })) || [])
  ];

  return (
    <div className="grid grid-cols-12 h-full bg-background text-foreground">
      {/* Main content */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <div className="col-span-12 md:col-span-12 h-full px-4 py-6 md:px-8 overflow-auto">
          <div className="">
            <h1 className="text-2xl font-bold mb-6">Servicios</h1>

            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="flex-1">
                <TextInput
                  placeholder="Buscar servicio..."
                  onChange={debouncedApplySearch}
                />
              </div>

              <div className="flex gap-4">
                <div className="max-w-44 w-full">
                  <Select
                    placeholder="Filtrar por área"
                    options={areaOptions}
                    value={selectedAreaFilter}
                    onChange={(option) => handleAreaFilter(option.value as string)}
                  />
                </div>

                <AddServiceModal refetch={refetch} />
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-md shadow-sm overflow-hidden">
              <ServicesTable
                services={services}
                onSelectRow={handleServiceSelect}
                onSort={handleSort}
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </div>

            <div className="mt-4">
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

        {/* Drawer Content */}
        <DrawerContent className="px-0 max-w-3xl w-full mx-auto rounded-t-xl">
          {selectedService && (
            <div className="p-6">
              <DrawerHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <DrawerTitle className="text-2xl font-bold">
                    {selectedService.name}
                  </DrawerTitle>
                  <Button
                    variant="ghost"
                    onClick={handleDrawerClose}
                    className="text-gray-500"
                  >
                    Cerrar
                  </Button>
                </div>
              </DrawerHeader>

              <div className="mt-6">
                <Tabs defaultValue="details">
                  <TabsList className="mb-6 bg-gray-100 p-1 w-full">
                    <TabsTrigger
                      value="details"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <div className="flex items-center">
                        <Tag className="mr-2 h-4 w-4" />
                        <span>Detalles</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="coverages"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <div className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Coberturas</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>

                  {/* Details Tab */}
                  <TabsContent value="details" className="mt-0">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Service Details */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Información del servicio</h3>

                          <div className="space-y-4">
                            <div>
                              <span className="text-sm text-gray-500">Nombre:</span>
                              <div className="font-medium">{selectedService.name}</div>
                            </div>

                            <div>
                              <span className="text-sm text-gray-500">Descripción:</span>
                              <div className="font-medium">
                                {selectedService.description || "Sin descripción"}
                              </div>
                            </div>

                            <div>
                              <span className="text-sm text-gray-500">Precio base:</span>
                              <div className="font-medium">
                                ${selectedService.price?.toFixed(2) || "0.00"}
                              </div>
                            </div>

                            <div className="flex items-start">
                              <MapPin className="text-gray-500 mr-2 mt-0.5" size={18} />
                              <div>
                                <span className="text-sm text-gray-500">Área:</span>
                                <div className="font-medium">{selectedService.area?.name || "No asignada"}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats or Additional Info */}
                        <div className="border-t pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6">
                          <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>

                          <div className="space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="text-sm text-gray-500">Total pacientes atendidos</div>
                              <div className="text-2xl font-semibold text-primary">--</div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="text-sm text-gray-500">Órdenes generadas</div>
                              <div className="text-2xl font-semibold text-primary">--</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-8 pt-4 border-t border-gray-200 flex gap-2">
                        <Button
                          variant="secondary"
                          className="flex-1"
                          onClick={() => {/* Implement edit */ }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => setIsDeleteModalOpen(true)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Coverages Tab */}
                  <TabsContent value="coverages" className="mt-0">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Coberturas para este servicio</h3>
                        <Button variant="primary" onClick={() => {/* Implement adding coverage */ }}>
                          <BsPlus size={20} className="mr-1" />
                          Añadir cobertura
                        </Button>
                      </div>

                      {/* Coverages List */}
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 text-left">
                            <tr>
                              <th className="px-4 py-3 text-sm font-medium text-gray-600">Obra Social</th>
                              <th className="px-4 py-3 text-sm font-medium text-gray-600">Importe</th>
                              <th className="px-4 py-3 text-sm font-medium text-gray-600">Copago</th>
                              <th className="px-4 py-3 text-sm font-medium text-gray-600">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {/* Placeholder for when no data is available */}
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                No hay coberturas registradas para este servicio
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Delete confirmation modal */}
      <Modal
        title="Eliminar servicio"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="p-4">
          <p className="mb-4">
            ¿Está seguro de que desea eliminar el servicio <strong>{selectedService?.name}</strong>?
            Esta acción no se puede deshacer.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              className="sm:flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="sm:flex-1"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Services;