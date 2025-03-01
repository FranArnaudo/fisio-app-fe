import { Appointment, AppointmentRange } from "@/types";
import { Calendar, dayjsLocalizer, Event, View } from "react-big-calendar";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import dayjs from "dayjs";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "../calendar.css"
import "react-big-calendar/lib/css/react-big-calendar.css";
import useFetch from "@/lib/hooks/useFetch";
import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";
import AddApointmentModal from "@/components/appointments/AddApointmentModal";
import ContextMenu from "@/components/ContextMenu";
import { render } from "react-dom";
import AppointmentContextMenu from "@/components/appointments/AppointmentContextMenu";
import { BsPlus } from "react-icons/bs";
dayjs.extend(localizedFormat);
dayjs.locale("es");
type EventWithId = Event & { id: string };
function getCurrentWeekRange(curr?: Date) {
  const today = curr ? dayjs(curr) : dayjs();
  const dayOfWeek = today.day();
  const sunday = today.subtract(dayOfWeek, "day");
  const monday = sunday.subtract(6, "day");

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
  const [rightClickedItem, setRightClickedItem] = useState<string | null>(null);
  const [isAddApptModalOpen, setIsAddApptModalOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<View>("week");
  const [currentDate, setCurrentDate] = useState(today);
  const [droppedEvent, setDroppedEvent] =
    useState<EventInteractionArgs<EventWithId>>();
  const [isDropOptionModalOpen, setIsDropOptionModalOpen] = useState(false);
  const currentRange = getCurrentWeekRange();
  const [apptRange, setApptRange] = useState(currentRange);
  const [appointments, setAppointments] = useState<EventWithId[]>([]);
  console.log("🚀 ~ Appointments ~ appointments:", appointments)

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

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    document.getElementById("context-menu")?.remove();
    const menu = document.createElement("div");
    const clickedElement = e.target as HTMLElement;
    console.log("🚀 ~ handleContextMenu ~ clickedElement.id:", clickedElement)
    setRightClickedItem(clickedElement.id);
    render(
      <ContextMenu anchorEl={clickedElement}>
        <AppointmentContextMenu />
      </ContextMenu>,
      menu
    );
  };
  const handleCloseContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    document.getElementById("context-menu")?.remove();
  };

  useEffect(() => {
    addEventListener("contextmenu", handleContextMenu);
    addEventListener("click", handleCloseContextMenu);
    return () => {
      removeEventListener("contextmenu", handleContextMenu);
      removeEventListener("click", handleCloseContextMenu);
    };
  });

  return (
    <div className="flex h-full flex-col gap-4  pt-4 px-4 sm:px-10 bg-background text-foreground">
      <AddApointmentModal refetchData={getAppts} open={isAddApptModalOpen} onClose={() => setIsAddApptModalOpen(false)} id={rightClickedItem} />
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
          event: CustomEvent,
        }}
        onView={handleViewChange}
        // onSelectSlot={(slotInfo) => console.log(slotInfo)}
        onEventDrop={handleEventDrop}
        onEventResize={(e) => console.log(e)}
        onRangeChange={handleRangeChange}
        className={"w-full h-full"}
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

const CustomEvent = ({ event }: { event: Event }) => {
  console.log("🚀 ~ CustomEvent ~ event:", event)
  return (
    <div className="custom-event-container">
      <div id="motherfucker" className="rbc-addons-dnd-resizable">
        {/* Resize Handle - Top */}
        {/* <div className="rbc-addons-dnd-resize-ns-anchor">
          <div className="rbc-addons-dnd-resize-ns-icon" />
        </div> */}

        {/* Event Label (Time) */}
        <div className="rbc-event-label-custom
        ">
          {dayjs(event.start).format("HH:mm")} – {dayjs(event.end).format("HH:mm")}
        </div>

        {/* Event Content (Title) */}
        <div className="rbc-event-content" id={event.resource.id}>
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
