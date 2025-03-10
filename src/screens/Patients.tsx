import PatientsTable from "@/components/patients/PatientsTable";
import Button from "@/components/ui/Button";
import { DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, Drawer } from "@/components/ui/drawer";
import Pagination from "@/components/ui/Pagination";
import Select from "@/components/ui/Select";
import TextInput from "@/components/ui/TextInput";
import useFetch from "@/lib/hooks/useFetch";
import useIsMobile from "@/lib/hooks/useIsMobile";
import usePagination from "@/lib/hooks/usePagination";
import { Appointment, PaginationParams } from "@/types";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BsSortAlphaDown } from "react-icons/bs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { AppointmentCardsGrid } from "@/components/appointments/AppointmentShortCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  } = usePagination(getPatientsWithPagination);
  let timeoutId: number | null = null;
  const isMobile = useIsMobile()
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([])

  const getPatientsAppointment = useCallback(async () => {
    const appts = await fetchData<Appointment[]>(`/appointments/patient/${selectedPatient}`)
    setPatientAppointments(appts)
  }, [selectedPatient])

  useEffect(() => {
    if (selectedPatient) {
      getPatientsAppointment()
    }
  }, [getPatientsAppointment])
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
              <PatientsTable patients={[...patients]} onSelectRow={id => setSelectedPatient(id)} />
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
        <DrawerContent className="px-5 md:w-1/2 w-[97%] " >
          <Tabs defaultValue="appointments" className="w-auto md:w-[400px]">
          <DrawerHeader>
            <DrawerTitle>Turnos</DrawerTitle>
            <TabsList>
              <TabsTrigger value="appointments">Turnos</TabsTrigger>
              <TabsTrigger value="orders">Órdenes</TabsTrigger>
            </TabsList>
            
          </DrawerHeader>
            <TabsContent value="appointments"><AppointmentCardsGrid appointments={patientAppointments}/></TabsContent>
            <TabsContent value="orders">Change your password here.</TabsContent>
          </Tabs>

          
       
        </DrawerContent>
      </Drawer>

    </div>
  );
};

export default Patients;
