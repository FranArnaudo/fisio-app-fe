import { useState, useCallback } from "react";
import { BsPlus, BsSearch } from "react-icons/bs";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import Pagination from "@/components/ui/Pagination";
import useFetch from "@/lib/hooks/useFetch";
import usePagination from "@/lib/hooks/usePagination";
import { PaginationParams, Professional, Appointment, Area, WithPagination } from "@/types";
import { Users, UserCircle, Briefcase, FileText, Calendar, Phone, Mail } from "lucide-react";
import { AppointmentCardsGrid } from "@/components/appointments/AppointmentShortCard";
import { AddProfessionalModal } from "@/components/professionals/AddProfessionalModal";
import { ProfessionalsTable } from "@/components/professionals/ProfessionalsTable";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import EditProfessionalModal from "@/components/professionals/EditProfessionalModal";
import DeleteProfessionalModal from "@/components/professionals/DeleteProfessionalModal";

const Professionals = () => {
  // State
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [appointmentStats, setAppointmentStats] = useState({
    today: 0,
    thisWeek: 0,
    total: 0
  });

  // Hooks
  const { fetchData } = useFetch();

  // Fetch professionals with pagination
  const getProfessionalsWithPagination = useCallback(({
    page,
    limit,
    search,
    filters,
  }: PaginationParams) => {
    const filtersQuery = Object.entries(filters)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    return fetchData(
      `/professionals?page=${page}&limit=${limit}&name=${search}${filtersQuery ? "&" + filtersQuery : ""
      }`,
      "GET"
    );
  }, [fetchData]);

  const {
    data: professionals,
    goToPage,
    totalPages,
    currentPage,
    setItemsPerPage,
    itemsPerPage,
    applySearch,
    refetch,
  } = usePagination<Professional>(getProfessionalsWithPagination);


  // Fetch appointments for selected professional
  const fetchProfessionalAppointments = useCallback(async (professionalId: string) => {
    try {
      const result = await fetchData(`/appointments/professional/${professionalId}`, "GET");
      setAppointments(result || []);

      // Calculate appointment statistics
      const today = dayjs().format('YYYY-MM-DD');
      const weekStart = dayjs().startOf('week').format('YYYY-MM-DD');
      const weekEnd = dayjs().endOf('week').format('YYYY-MM-DD');

      if (result && Array.isArray(result)) {
        // Count today's appointments
        const todayAppts = result.filter(appt =>
          dayjs(appt.appointmentDatetime).format('YYYY-MM-DD') === today
        );

        // Count this week's appointments
        const weekAppts = result.filter(appt => {
          const apptDate = dayjs(appt.appointmentDatetime).format('YYYY-MM-DD');
          return apptDate >= weekStart && apptDate <= weekEnd;
        });

        // Update state with statistics
        setAppointmentStats({
          today: todayAppts.length,
          thisWeek: weekAppts.length,
          total: result.length
        });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Error al cargar los turnos del profesional");
    }
  }, [fetchData]);

  // Handle professional selection for drawer
  const handleProfessionalSelect = async (professional: Professional) => {
    setSelectedProfessional(professional);
    setIsDrawerOpen(true);
    await fetchProfessionalAppointments(professional.id);
  };

  // Reset selections when drawer closes
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedProfessional(null);
      setAppointments([]);
      setAppointmentStats({
        today: 0,
        thisWeek: 0,
        total: 0
      });
    }, 300);
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

  const handleEditProfessional = (id: string) => {
    const selected = professionals.find(prof => prof.id === id)
    if (selected) {
      setIsEditModalOpen(true)
      setSelectedProfessional(selected)
    }
  }

  const handleDeleteProfessional = (id: string) => {
    const selected = professionals.find(prof => prof.id === id)
    if (selected) {
      setIsDeleteModalOpen(true)
      setSelectedProfessional(selected)
    }
  }
  return (
    <div className="grid grid-cols-12 h-full bg-background text-foreground">
      <EditProfessionalModal professional={selectedProfessional} open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} refetch={refetch} />
      <DeleteProfessionalModal professional={selectedProfessional} open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} refetch={refetch} />
      {/* Main content */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <div className="col-span-12 md:col-span-12 h-full px-4 py-6 md:px-8 overflow-auto">
          <div className="">
            <h1 className="text-2xl font-bold mb-6">Profesionales</h1>

            <div className="flex justify-between gap-4 mb-6">
              <div className="flex gap-4 flex-1">
                <div className="relative w-full">
                  <TextInput
                    placeholder="Buscar profesional..."
                    onChange={debouncedApplySearch}
                    className="pl-10"
                    startIcon={<BsSearch />}
                  />

                </div>
              </div>
              <AddProfessionalModal refetch={refetch} />
            </div>

            <div className="bg-white border border-gray-300 rounded-md shadow-sm overflow-hidden">
              <DrawerTrigger asChild>
                <div className="cursor-pointer">
                  <ProfessionalsTable
                    professionals={professionals}
                    onSelectRow={handleProfessionalSelect}
                    onEdit={handleEditProfessional}
                    onDelete={handleDeleteProfessional}

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
            {selectedProfessional ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-medium"
                      style={{ backgroundColor: selectedProfessional.colorHex || '#3a9ea5' }}
                    >
                      {selectedProfessional.firstname[0]}{selectedProfessional.lastname[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedProfessional.firstname} {selectedProfessional.lastname}
                      </h2>
                      <div className="flex items-center text-gray-500">
                        <UserCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">{selectedProfessional.username}</span>
                      </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Contact Information */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-primary" />
                      Información de contacto
                    </h3>

                    <div className="space-y-3">
                      {selectedProfessional.email && (
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-gray-500 mr-2" />
                          <span>{selectedProfessional.email}</span>
                        </div>
                      )}

                      {selectedProfessional.phone && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-500 mr-2" />
                          <span>{selectedProfessional.phone}</span>
                        </div>
                      )}

                      {selectedProfessional.area && (
                        <div className="flex items-center">
                          <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
                          <span>{selectedProfessional.area.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule Summary */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      Resumen de agenda
                    </h3>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Turnos hoy:</span>
                        <span className="font-medium">{appointmentStats.today}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Turnos esta semana:</span>
                        <span className="font-medium">{appointmentStats.thisWeek}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total de turnos:</span>
                        <span className="font-medium">{appointmentStats.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="appointments">
                  <TabsList className="mb-6 bg-gray-100 p-1 w-full">
                    <TabsTrigger
                      value="appointments"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Turnos ({appointments.length})</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="orders"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Órdenes</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="appointments" className="mt-0">
                    {appointments.length > 0 ? (
                      <AppointmentCardsGrid appointments={appointments} />
                    ) : (
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No hay turnos</h3>
                        <p className="text-gray-500 mb-4">
                          Este profesional no tiene turnos asignados.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="orders" className="mt-0">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No hay órdenes</h3>
                      <p className="text-gray-500 mb-4">
                        No hay órdenes médicas asociadas a este profesional.
                      </p>
                    </div>
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
    </div>
  );
};

export default Professionals;