import { Appointment, AppointmentRange } from "@/types";
import { Calendar, dayjsLocalizer, Event, View } from "react-big-calendar";
import { PiArrowArcLeftBold, PiArrowArcRightBold } from "react-icons/pi";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import dayjs from "dayjs";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "../calendar.css"
import "react-big-calendar/lib/css/react-big-calendar.css";
import useFetch from "@/lib/hooks/useFetch";
import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { BsPlus } from "react-icons/bs";
import { FaTrash } from "react-icons/fa";
import AppointmentModal from "@/components/appointments/AppointmentModal";
import DeleteAppointmentModal from "@/components/appointments/DeleteAppointmentModal";
import useIsMobile from "@/lib/hooks/useIsMobile";
dayjs.extend(localizedFormat);
dayjs.locale("es");
type EventWithId = Event & { id: string };
function getCurrentWeekRange(curr?: Date) {
  const today = curr ? dayjs(curr) : dayjs();
  const monday = today.day() === 0 ? today.subtract(6, "day") : today.subtract(today.day() - 1, "day");
  const sunday = monday.add(6, "day");

  return {
    start: monday.format("YYYY-MM-DD"),
    end: sunday.format("YYYY-MM-DD"),
  };
}

const today = new Date();
const startHour = 8;
const endHour = 20;
const DnDCalendar = withDragAndDrop(Calendar);
const Appointments = () => {
  const { fetchData } = useFetch();
  const [isAddApptModalOpen, setIsAddApptModalOpen] = useState(false);
  const [isDeleteApptModalOpen, setIsDeleteApptModalOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState('')
  const isMobile = useIsMobile()
  const [calendarView, setCalendarView] = useState<View>(isMobile ? "day" : "week");
  const [currentDate, setCurrentDate] = useState(today);
  const [droppedEvent, setDroppedEvent] =
    useState<EventInteractionArgs<EventWithId>>();
  const [isDropOptionModalOpen, setIsDropOptionModalOpen] = useState(false);
  const currentRange = getCurrentWeekRange();
  const [apptRange, setApptRange] = useState(currentRange);
  const [appointments, setAppointments] = useState<EventWithId[]>([]);
  const handleRangeChange = (
    range: AppointmentRange | Date[],
    view: View = calendarView
  ) => {
    if (view === "week" && Array.isArray(range)) {
      setApptRange({
        start: dayjs(range[0]).format("YYYY-MM-DD"),
        end: dayjs(range[6]).format("YYYY-MM-DD"),
      });
    } else if (view === "day" && Array.isArray(range)) {
      setApptRange({
        start: dayjs(range[0]).format("YYYY-MM-DD"),
        end: dayjs(range[0]).format("YYYY-MM-DD"),
      });
    } else if (view === "month") {
      setApptRange({
        start: dayjs((range as AppointmentRange).start).format("YYYY-MM-DD"),
        end: dayjs((range as AppointmentRange).end).format("YYYY-MM-DD"),
      });
    }
  };
  const handleViewChange = (view: View) => {
    setCalendarView(view);
  };
  const handleEventDrop = (e: EventInteractionArgs<object>) => {
    const newAppointments = [...appointments];
    newAppointments.push({
      ...e.event,
      start: e.start as any,
      end: e.end as any,
      id: `${(e.event as EventWithId).id}_duplicated_${e.start.toString()}`,
    });
    setAppointments(newAppointments);
    setDroppedEvent(e as EventInteractionArgs<EventWithId>);
    setIsDropOptionModalOpen(true);
  };

  const handleMoveEvent = async () => {
    if (droppedEvent) {
      const originalApptId = droppedEvent.event.id.split("_")[0];
      await fetchData(`/appointments/${originalApptId}`, "PATCH", {
        appointmentDatetime: droppedEvent.start,
        duration: dayjs(droppedEvent.end).diff(
          dayjs(droppedEvent.start),
          "minute"
        ),
      });
      getAppts();
      setIsDropOptionModalOpen(false);
      toast.success("Evento movido con éxito");
    }
  };

  const handleMoveToWeekEvent = async (id: string, to: 'prev' | 'next') => {
    const appt = appointments.find(apt => apt.id === id)
    const moveTo = to === "prev" ? dayjs(appt?.resource.appointmentDatetime).subtract(1, 'week')
      : dayjs(appt?.resource.appointmentDatetime).add(1, 'week')
    await fetchData(`/appointments/${id}`, "PATCH", {
      appointmentDatetime: moveTo
    });
    getAppts();
    toast.success("Evento movido con éxito");
  };
  const handleDeleteEvent = async () => {
    if (selectedAppt) {
      await fetchData(`/appointments/${selectedAppt}`, "DELETE");
      setIsDeleteApptModalOpen(false)
      getAppts()
      toast.success("Evento eliminado con exito")
    }
  }
  const handleDuplicateEvent = async () => {
    if (droppedEvent) {
      const newAppt: Partial<Appointment> = {
        ...droppedEvent.event.resource,
        appointmentDatetime: droppedEvent.start,
        duration: dayjs(droppedEvent.end).diff(
          dayjs(droppedEvent.start),
          "minute"
        ),
        patient: droppedEvent.event.resource.patient.id,
        professional: droppedEvent.event.resource.professional.id,
      };
      delete newAppt.id;
      const created = await fetchData("/appointments", "POST", newAppt);
      if (created) {
        toast.success("Evento duplicado con éxito");
        getAppts();
      }
      setIsDropOptionModalOpen(false);
    }
  };
  const handleCloseDropOptionModal = () => {
    setIsDropOptionModalOpen(false);
    setAppointments(
      appointments.filter((appt) => !appt.id.includes("duplicated"))
    );
  };
  const getAppts = useCallback(async () => {
    const appts = await fetchData(
      `/appointments/calendar?start=${apptRange.start}&end=${apptRange.end}`
    );
    const apptsWithCorrectedDate = appts.map(
      (appt: Event & { start: string; end: string }) => ({
        ...appt,
        start: new Date(appt.start),
        end: new Date(appt.end),
      })
    );
    setAppointments(apptsWithCorrectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apptRange]);
  useEffect(() => {
    getAppts();
  }, [getAppts]);

  console.log(appointments)
  const selectedApptInitialValues = useMemo(() => {
    if (selectedAppt === "") return {}
    const appt = appointments.find(ap => ap.id === selectedAppt)?.resource
    return {
      appointmentDatetime: dayjs(appt.appointmentDatetime).format("YYYY-MM-DDTHH:mm"),
      status: appt.status,
      duration: appt.duration,
      professional: appt.professional.id,
      patient: appt.patient.id,
      patientFirstname: "",
      patientLastname: "",
      patientPhone: "",
      notes: appt.notes,
    }
  }, [selectedAppt])
  return (
    <div className="flex h-full flex-col gap-4  pt-4 px-4 sm:px-10 bg-background text-foreground">
      <AppointmentModal refetchData={getAppts} open={isAddApptModalOpen} onClose={() => {
        setSelectedAppt('')
        setIsAddApptModalOpen(false)
      }}
        initialValues={selectedApptInitialValues} />
      <DeleteAppointmentModal
        open={isDeleteApptModalOpen}
        onDelete={handleDeleteEvent}
        onClose={() => {
          setSelectedAppt('')
          setIsDeleteApptModalOpen(false)
        }}
      />
      <div className="flex place-content-end">
        <Button
          iconStart={<BsPlus size={24} />}
          onClick={() => {
            setIsAddApptModalOpen(true);
          }}
        >
          Agregar turno
        </Button>
      </div>
      <Modal
        title="Que desea hacer?"
        isOpen={isDropOptionModalOpen}
        onClose={handleCloseDropOptionModal}
      >
        <div className="flex w-full flex-col gap-2">
          <div className="flex gap-2">
            <Button className="w-full" onClick={handleMoveEvent}>
              Mover
            </Button>
            <Button className="w-full" onClick={handleDuplicateEvent}>
              Duplicar
            </Button>
          </div>
          <Button
            className="w-full"
            variant="secondary"
            onClick={handleCloseDropOptionModal}
          >
            Cancelar
          </Button>
        </div>
      </Modal>
      <DnDCalendar
        localizer={dayjsLocalizer(dayjs)}
        events={appointments}
        date={currentDate}
        onNavigate={(date) => setCurrentDate(date)}
        view={calendarView}
        step={15}
        timeslots={4}
        components={{
          event: (props) => <CustomEvent {...props}
            onMoveToWeek={handleMoveToWeekEvent}
            onDelete={(id: string) => {
              setSelectedAppt(id)
              setIsDeleteApptModalOpen(true)
            }}
          />,
        }}
        onView={handleViewChange}
        {...(isMobile ?
          {
            onSelectEvent: (event) => {
              setIsAddApptModalOpen(true)
              setSelectedAppt((event as EventWithId).id)
            }
          } :
          {
            onDoubleClickEvent: (event) => {
              setIsAddApptModalOpen(true)
              setSelectedAppt((event as EventWithId).id)
            }
          })}
        onEventDrop={handleEventDrop}
        onEventResize={(e) => console.log(e)}
        onRangeChange={handleRangeChange}
        className={"w-full h-full"}
        eventPropGetter={(props: any) => ({ style: { background: props.resource.professional.colorHex } })}
        min={
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            startHour,
            0
          )
        }
        max={
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            endHour,
            0
          )
        }
      />
    </div>
  );
};

export default Appointments;


type CustomEventProps = {
  onMoveToWeek: (id: string, to: 'prev' | 'next') => void;
  onDelete: (id: string) => void;
  event: Event
}
const CustomEvent = ({ event, onMoveToWeek, onDelete }: CustomEventProps) => {
  const isMobile = useIsMobile()
  const backgroundColor = event.resource.professional.colorHex
  return (
    <div className={`custom-event-container px-2 pt-1 `} style={{ background: backgroundColor }}>
      <div className="rbc-addons-dnd-resizable">
        {/* Resize Handle - Top */}
        {/* <div className="rbc-addons-dnd-resize-ns-anchor">
          <div className="rbc-addons-dnd-resize-ns-icon" />
        </div> */}

        {/* Event Label (Time) */}
        <div className="flex justify-between pb-1">

          <div className="rbc-event-label-custom
        ">
            {dayjs(event.start).format("HH:mm")} – {dayjs(event.end).format("HH:mm")}
          </div>
          {!isMobile && <div className="flex justify-end flex-1">
            <div className="flex justify-end flex-1 pr-2">
              <PiArrowArcLeftBold className="hover:bg-black/50 rounded" onClick={() => onMoveToWeek((event as EventWithId).id, 'prev')} />
              <PiArrowArcRightBold className="hover:bg-black/50 rounded" onClick={() => onMoveToWeek((event as EventWithId).id, 'next')} />
            </div>
            <FaTrash onClick={() => onDelete((event as EventWithId).id)} className="hover:text-red-500 rounded" />
          </div>}
          <div>
          </div>
        </div>

        {/* Event Content (Title) */}
        <div className="rbc-event-content" id={event.resource.id} >
          {event.title}
        </div>

        {/* Resize Handle - Bottom */}
        {/* <div className="rbc-addons-dnd-resize-ns-anchor">
          <div className="rbc-addons-dnd-resize-ns-icon" />
        </div> */}
      </div>
    </div>
  );
};
