import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, Check, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import HealthcaresTable from "@/components/healthcares/HealthcaresTable";
import AddHealthcareModal from "@/components/healthcares/AddHealthcareModal";
import Pagination from "@/components/ui/Pagination";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useFetch from "@/lib/hooks/useFetch";
import usePagination from "@/lib/hooks/usePagination";
import { Healthcare, Order, PaginationParams } from "@/types";
import Modal from "@/components/ui/Modal";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import Select from "@/components/ui/Select";

const Healthcares = () => {
  // State
  const [selectedHealthcare, setSelectedHealthcare] = useState<Healthcare | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionDate, setSubmissionDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const { fetchData } = useFetch();

  // Fetch healthcare list with pagination
  const getHealthcaresWithPagination = useCallback(({
    page,
    limit,
    search,
    filters,
  }: PaginationParams) => {
    const filtersQuery = Object.entries(filters)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return fetchData(
      `/healthcare?page=${page}&limit=${limit}&name=${search}${filtersQuery ? "&" + filtersQuery : ""
      }`,
      "GET"
    );
  }, [fetchData]);

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

  // Fetch orders for selected healthcare
  const fetchHealthcareOrders = useCallback(async (healthcareId: string) => {
    try {
      const result = await fetchData(`/orders/healthcare/${healthcareId}`, "GET");
      setOrders(result || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error al cargar las órdenes");
    }
  }, [fetchData]);

  // Filter orders based on tab and selected year
  useEffect(() => {
    if (!orders.length) {
      setFilteredOrders([]);
      return;
    }

    // Group by submission status and year
    const filtered = orders.filter(order => {
      if (order.submittedAt) {
        const submittedYear = dayjs(order.submittedAt).year();
        return submittedYear === selectedYear;
      }
      return true;
    });

    setFilteredOrders(filtered);
  }, [orders, selectedYear]);

  // Handle healthcare toggle (active/inactive)
  const handleToggle = async (id: string) => {
    try {
      await fetchData(`/healthcare/${id}/toggle`, "PATCH");
      refetch();
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar el estado");
    }
  };

  // Handle healthcare selection for drawer
  const handleHealthcareSelect = async (healthcare: Healthcare) => {
    setSelectedHealthcare(healthcare);
    setIsOrderDrawerOpen(true);
    await fetchHealthcareOrders(healthcare.id);
  };

  // Handle bulk order submission
  const handleBulkSubmit = async () => {
    if (!selectedOrderIds.length) {
      toast.warning("Seleccione al menos una orden para presentar");
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        orderIds: selectedOrderIds.map(id => ({ id })),
        submittedAt: submissionDate
      };

      await fetchData("/orders/bulk-submit", "POST", payload);
      toast.success("Órdenes presentadas exitosamente");

      // Refresh orders
      if (selectedHealthcare) {
        await fetchHealthcareOrders(selectedHealthcare.id);
      }

      // Reset selection
      setSelectedOrderIds([]);
      setIsSubmitModalOpen(false);
    } catch (error) {
      console.error("Error submitting orders:", error);
      toast.error("Error al presentar las órdenes");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle order checkbox selection
  const handleOrderSelection = (orderId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedOrderIds(prev => [...prev, orderId]);
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };

  // Reset selections when drawer closes
  const handleDrawerClose = () => {
    setIsOrderDrawerOpen(false);
    setTimeout(() => {
      setSelectedHealthcare(null);
      setOrders([]);
      setFilteredOrders([]);
      setSelectedOrderIds([]);
    }, 300);
  };

  // Get available years from submitted orders
  const getAvailableYears = () => {
    if (!orders.length) return [new Date().getFullYear()];

    const yearsSet = new Set<number>();
    yearsSet.add(new Date().getFullYear()); // Always include current year

    orders.forEach(order => {
      if (order.submittedAt) {
        yearsSet.add(dayjs(order.submittedAt).year());
      }
    });

    return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  };

  // Group submitted orders by month
  const getOrdersByMonth = () => {
    if (!filteredOrders.length) return [];

    const submittedOrders = filteredOrders.filter(
      order => order.status === "Presentado" && order.submittedAt
    );

    // Group by month
    const groupedByMonth = submittedOrders.reduce((acc, order) => {
      const month = dayjs(order.submittedAt).format("MMMM YYYY");
      acc[month] = acc[month] || [];
      acc[month].push(order);
      return acc;
    }, {} as Record<string, Order[]>);

    // Convert to array and sort by date (newest first)
    return Object.entries(groupedByMonth)
      .map(([month, orders]) => ({ month, orders }))
      .sort((a, b) => {
        const dateA = dayjs(dayjs(a.orders[0].submittedAt).format("YYYY-MM"));
        const dateB = dayjs(dayjs(b.orders[0].submittedAt).format("YYYY-MM"));
        return dateB.diff(dateA);
      });
  };

  // Get pending (unsubmitted) orders
  const getPendingOrders = () => {
    return filteredOrders.filter(order => order.status === "Generada");
  };

  // Get year options for select
  const yearOptions = getAvailableYears().map(year => ({
    id: year.toString(),
    value: year.toString(),
    text: year.toString()
  }));

  // Search debounce handling
  let timeoutId: number | null = null;
  const debouncedApplySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      applySearch(e.target.value);
      timeoutId = null;
    }, 500);
  };

  return (
    <div className="grid grid-cols-12 h-full bg-background text-foreground">
      {/* Main content */}
      <Drawer open={isOrderDrawerOpen} onOpenChange={setIsOrderDrawerOpen}>
        <div className="col-span-12 md:col-span-12 h-full px-4 py-6 md:px-8 overflow-auto">
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
              <DrawerTrigger asChild>
                <div className="cursor-pointer">
                  <HealthcaresTable
                    healthcares={[...healthcares]}
                    handleToggle={handleToggle}
                    onSelectRow={(healthcare) => handleHealthcareSelect(healthcare)}
                  />
                </div>
              </DrawerTrigger>
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

        {/* Drawer Content */}
        <DrawerContent className="px-0 max-w-4xl w-full mx-auto rounded-t-xl">
          <div className="p-6">
            {selectedHealthcare ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedHealthcare.name}</h2>
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full mr-2 ${selectedHealthcare.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-500">
                        {selectedHealthcare.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleDrawerClose}
                    className="text-gray-500"
                  >
                    Cerrar
                  </Button>
                </div>

                {/* Year filter */}
                <div className="flex items-center mb-4 gap-2">
                  <span className="text-sm font-medium text-gray-600">Año:</span>
                  <div className="w-32">
                    <Select
                      options={yearOptions}
                      value={String(selectedYear)}
                      onChange={(option) => setSelectedYear(Number(option.value))}
                    />
                  </div>
                </div>

                <Tabs defaultValue="pending">
                  <TabsList className="mb-6 bg-gray-100 p-1 w-full">
                    <TabsTrigger
                      value="pending"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>A presentar ({getPendingOrders().length})</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="submitted"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <div className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        <span>Presentadas</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>

                  {/* Pending Orders Tab */}
                  <TabsContent value="pending" className="mt-0">
                    <h3 className="text-lg font-semibold mb-4">Órdenes a presentar</h3>
                    {getPendingOrders().length > 0 && (
                      <div className="mb-4 flex justify-between items-center">
                        <Button
                          variant="primary"
                          onClick={() => setIsSubmitModalOpen(true)}
                          disabled={selectedOrderIds.length === 0}
                        >
                          Presentar seleccionadas
                        </Button>
                      </div>
                    )}

                    {getPendingOrders().length > 0 ? (
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-10">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300"
                                  checked={
                                    getPendingOrders().length > 0 &&
                                    selectedOrderIds.length === getPendingOrders().length
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedOrderIds(getPendingOrders().map(o => o.id));
                                    } else {
                                      setSelectedOrderIds([]);
                                    }
                                  }}
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Paciente</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Servicio</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Creada</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Expira</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {getPendingOrders().map((order) => (
                              <tr
                                key={order.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    checked={selectedOrderIds.includes(order.id)}
                                    onChange={(e) => handleOrderSelection(order.id, e.target.checked)}
                                  />
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {order.patient.firstname} {order.patient.lastname}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {order.service.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {dayjs(order.createdAt).format('DD/MM/YYYY')}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {order.expiresAt ? (
                                    <span className={dayjs(order.expiresAt).isBefore(dayjs()) ? 'text-red-600 font-medium' : ''}>
                                      {dayjs(order.expiresAt).format('DD/MM/YYYY')}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">No expira</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No hay órdenes pendientes</h3>
                        <p className="text-gray-500 mb-4">
                          Todas las órdenes han sido presentadas para esta obra social.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Submitted Orders Tab */}
                  <TabsContent value="submitted" className="mt-0">
                    <h3 className="text-lg font-semibold mb-4">Órdenes presentadas</h3>

                    {getOrdersByMonth().length > 0 ? (
                      <div className="space-y-6">
                        {getOrdersByMonth().map(({ month, orders }) => (
                          <div key={month} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                              <h4 className="font-medium text-gray-900 flex items-center">
                                <Calendar className="h-4 w-4 text-primary mr-2" />
                                {month}
                                <span className="ml-2 text-sm text-gray-500">({orders.length} órdenes)</span>
                              </h4>
                            </div>
                            <table className="w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Paciente</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Servicio</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">Presentada</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {orders.map((order) => (
                                  <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                      {order.patient.firstname} {order.patient.lastname}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {order.service.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {order.submittedAt ? dayjs(order.submittedAt).format('DD/MM/YYYY') : 'N/A'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No hay órdenes presentadas</h3>
                        <p className="text-gray-500 mb-4">
                          No se han presentado órdenes para esta obra social en {selectedYear}.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium text-gray-900 mb-1">Cargando información...</h3>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>



      {/* Bulk submission modal */}
      <Modal
        title="Presentar órdenes"
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      >
        <div className="p-4">
          <p className="mb-4">
            Está a punto de presentar {selectedOrderIds.length} órdenes para {selectedHealthcare?.name}.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de presentación
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm"
              value={submissionDate}
              onChange={(e) => setSubmissionDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button
              variant="ghost"
              onClick={() => setIsSubmitModalOpen(false)}
              className="sm:flex-1"
            >
              Cancelar
            </Button>
            <Button
              className="sm:flex-1"
              loading={isLoading}
              disabled={isLoading}
              onClick={handleBulkSubmit}
            >
              Confirmar presentación
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Healthcares;