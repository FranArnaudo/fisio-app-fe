import PatientsTable from "@/components/patients/PatientsTable";
import Button from "@/components/ui/Button";
import { DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose, Drawer } from "@/components/ui/drawer";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import TextInput from "@/components/ui/TextInput";
import useFetch from "@/lib/hooks/useFetch";
import useIsMobile from "@/lib/hooks/useIsMobile";
import usePagination from "@/lib/hooks/usePagination";
import { Appointment, Order, Patient, PaginationParams } from "@/types";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { BsSortAlphaDown, BsPlus } from "react-icons/bs";
import { X } from "lucide-react";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { AppointmentCardsGrid } from "@/components/appointments/AppointmentShortCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrdersTabWithForm from "../components/orders/OrdersTabsWithForm";
import PatientDrawerHeader from "@/components/patients/PatientsDrawerHeader";
import { toast } from "react-toastify";
dayjs.extend(localizedFormat);

const Patients = () => {
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
      `/patients?page=${page}&limit=${limit}&name=${search}${filtersQuery ? "&" + filtersQuery : ""
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
    refetch
  } = usePagination(getPatientsWithPagination);
  let timeoutId: number | null = null;
  const isMobile = useIsMobile()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null)
  const [patientApptsAndOrders, setPatientApptsAndOrders] = useState<{ appts: Appointment[], orders: Order[] }>({ appts: [], orders: [] })
  const [isLoadingPatientData, setIsLoadingPatientData] = useState(false)

  const getPatientDetails = useCallback(async (patientId: string) => {
    setIsLoadingPatientData(true)
    try {
      const patient = await fetchData<Patient>(`/patients/${patientId}`)
      setSelectedPatientData(patient)
    } catch (error) {
      console.error('Error fetching patient details:', error)
    } finally {
      setIsLoadingPatientData(false)
    }
  }, [])

  const deletePatient = async (id: string) => {
    await fetchData<any[]>(`/patients/${id}`, 'DELETE').then(_ => {
      refetch()
      toast.success('Paciente eliminado correctamente')
    })

  }

  const getPatientsApptAndOrders = useCallback(async () => {
    const appts = await fetchData<Appointment[]>(`/appointments/patient/${selectedPatientId}`)
    const orders = await fetchData<Order[]>(`/orders/patient/${selectedPatientId}`)
    setPatientApptsAndOrders({ appts, orders })
  }, [selectedPatientId])

  useEffect(() => {
    if (selectedPatientId) {
      getPatientsApptAndOrders()
      getPatientDetails(selectedPatientId)
    }
  }, [getPatientsApptAndOrders, getPatientDetails, selectedPatientId])

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
      <Drawer direction={"right"}>

        <div className="col-span-12 md:col-span-12 h-full px-4 py-6 md:px-8 overflow-auto">
          <div>
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
              <PatientsTable patients={[...patients]} onSelectRow={id => setSelectedPatientId(id)} onDelete={deletePatient} />
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
        <DrawerContent className="px-5 md:w-1/2 w-[97%] max-h-screen" >
          <DrawerHeader className="flex justify-between items-center pb-2">
            <DrawerTitle className="text-xl">Ficha del paciente</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="overflow-y-auto pr-1 pb-16" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            {/* Patient header information */}
            <PatientDrawerHeader patient={selectedPatientData} isLoading={isLoadingPatientData} />

            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="appointments" className="flex-1">Turnos</TabsTrigger>
                <TabsTrigger value="orders" className="flex-1">Órdenes</TabsTrigger>
              </TabsList>

              <TabsContent value="appointments">
                <AppointmentCardsGrid appointments={patientApptsAndOrders.appts} />
              </TabsContent>

              <TabsContent value="orders">
                {selectedPatientId && (
                  <OrdersTabWithForm
                    patientId={selectedPatientId}
                    orders={patientApptsAndOrders.orders}
                    onOrdersUpdate={getPatientsApptAndOrders}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Patients;
