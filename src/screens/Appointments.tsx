import { Appointment, AppointmentRange } from "@/types";
import { Calendar, dayjsLocalizer, Event, View } from "react-big-calendar";
import { PiArrowArcLeftBold, PiArrowArcRightBold } from "react-icons/pi";
import withDragAndDrop, {
  EventInteractionArgs,
} from "react-big-calendar/lib/addons/dragAndDrop";
import dayjs from "dayjs";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "../calendar.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useFetch from "@/lib/hooks/useFetch";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { BsPlus, BsDash } from "react-icons/bs";
import { 
  FaTrash, 
  FaCalendarDay, 
  FaCalendarWeek, 
  FaCalendarAlt, 
  FaList,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarCheck
} from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import AppointmentModal from "@/components/appointments/AppointmentModal";
import DeleteAppointmentModal from "@/components/appointments/DeleteAppointmentModal";
import useIsMobile from "@/lib/hooks/useIsMobile";

// Configure dayjs
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

// Width step for zoom buttons
const WIDTH_STEP = 25;
const MIN_WIDTH = 125;
const MAX_WIDTH = 400;

const today = new Date();
const startHour = 8;
const endHour = 20;
const DnDCalendar = withDragAndDrop(Calendar);

const Appointments = () => {
  const { fetchData, loading: isLoading } = useFetch();
  const [isAddApptModalOpen, setIsAddApptModalOpen] = useState(false);
  const [isDeleteApptModalOpen, setIsDeleteApptModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState('');
  const isMobile = useIsMobile();
  const [calendarView, setCalendarView] = useState<View>(isMobile ? "day" : "week");
  const [currentDate, setCurrentDate] = useState(today);
  const [droppedEvent, setDroppedEvent] = useState<EventInteractionArgs<EventWithId>>();
  const [modalInitialValues, setModalInitialValues] = useState({});
  const [isDropOptionModalOpen, setIsDropOptionModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<EventWithId[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayColumnWidth, setDayColumnWidth] = useState(200);
  
  // Refs for scroll synchronization
  const headerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  
  // We'll store the appointment range in a ref to avoid rerendering cycles
  const apptRangeRef = useRef(getCurrentWeekRange(currentDate));

  // Handle zoom in/out (increase/decrease column width)
  const handleZoomIn = () => {
    setDayColumnWidth(prev => Math.min(prev + WIDTH_STEP, MAX_WIDTH));
  };

  const handleZoomOut = () => {
    setDayColumnWidth(prev => Math.max(prev - WIDTH_STEP, MIN_WIDTH));
  };
  
  // Set up scroll synchronization
  useEffect(() => {
    // Function to set up scroll synchronization
    const setupScrollSync = () => {
      // Find elements after component has mounted
      if (!headerRef.current) {
        headerRef.current = document.querySelector('.rbc-time-header');
      }
      if (!contentRef.current) {
        contentRef.current = document.querySelector('.rbc-time-content');
      }
      
      if (headerRef.current && contentRef.current) {
        // Set up event listeners for scroll synchronization
        const handleContentScroll = () => {
          if (contentRef.current && headerRef.current) {
            headerRef.current.scrollLeft = contentRef.current.scrollLeft;
          }
        };
        
        const handleHeaderScroll = () => {
          if (headerRef.current && contentRef.current) {
            contentRef.current.scrollLeft = headerRef.current.scrollLeft;
          }
        };
        
        // Add event listeners
        contentRef.current.addEventListener('scroll', handleContentScroll);
        headerRef.current.addEventListener('scroll', handleHeaderScroll);
        
        // Return cleanup function
        return () => {
          if (contentRef.current) {
            contentRef.current.removeEventListener('scroll', handleContentScroll);
          }
          if (headerRef.current) {
            headerRef.current.removeEventListener('scroll', handleHeaderScroll);
          }
        };
      }
    };
    
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const cleanup = setupScrollSync();
      
      return () => {
        if (cleanup) cleanup();
      };
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [calendarView]); // Only re-run when view changes
  
  // Inject custom CSS for day width control
  useEffect(() => {
    // Create a style element to inject custom CSS
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .rbc-time-view .rbc-day-slot {
        min-width: ${dayColumnWidth}px;
      }
      .rbc-time-header-content .rbc-header {
        min-width: ${dayColumnWidth}px;
      }
    `;
    
    // Add an ID to prevent duplicates
    styleEl.id = 'dynamic-calendar-styles';
    
    // Remove any existing style with the same ID
    const existingStyle = document.getElementById('dynamic-calendar-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Add the new style to the document head
    document.head.appendChild(styleEl);
    
    // Clean up function
    return () => {
      const styleToRemove = document.getElementById('dynamic-calendar-styles');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [dayColumnWidth]);
  
  // Update appointment range when date or view changes
  useEffect(() => {
    if (calendarView === 'week') {
      apptRangeRef.current = getCurrentWeekRange(currentDate);
    } else if (calendarView === 'day') {
      const day = dayjs(currentDate);
      apptRangeRef.current = {
        start: day.format("YYYY-MM-DD"),
        end: day.format("YYYY-MM-DD"),
      };
    } else if (calendarView === 'month') {
      const month = dayjs(currentDate);
      apptRangeRef.current = {
        start: month.startOf("month").format("YYYY-MM-DD"),
        end: month.endOf("month").format("YYYY-MM-DD"),
      };
    }
    
    // Fetch appointments with the new range
    getAppts();
  }, [calendarView, currentDate]); // No getAppts in dependency array
  
  // Handle date range changes - uses apptRangeRef to avoid rerendering
  const handleRangeChange = (
    range: AppointmentRange | Date[],
    view: View = calendarView
  ) => {
    try {
      if (view === "week" && Array.isArray(range)) {
        apptRangeRef.current = {
          start: dayjs(range[0]).format("YYYY-MM-DD"),
          end: dayjs(range[range.length - 1]).format("YYYY-MM-DD"),
        };
      } else if (view === "day" && Array.isArray(range)) {
        apptRangeRef.current = {
          start: dayjs(range[0]).format("YYYY-MM-DD"),
          end: dayjs(range[0]).format("YYYY-MM-DD"),
        };
      } else if (view === "month" && !Array.isArray(range)) {
        apptRangeRef.current = {
          start: dayjs((range as AppointmentRange).start).format("YYYY-MM-DD"),
          end: dayjs((range as AppointmentRange).end).format("YYYY-MM-DD"),
        };
      }
      
      // Fetch appointments with the new range
      getAppts();
    } catch (err) {
      console.error("Error handling range change:", err);
      setError("Error updating calendar range. Please try again.");
    }
  };

  const handleViewChange = (view: View) => {
    setCalendarView(view);
  };

  const handleEventDrop = (e: EventInteractionArgs<object>) => {
    try {
      const newAppointments = [...appointments];
      const eventWithId = e.event as EventWithId;
      
      // Create temporary event with unique ID
      newAppointments.push({
        ...eventWithId,
        //@ts-ignore
        start: e.start,
        //@ts-ignore
        end: e.end,
        id: `${eventWithId.id}_duplicated_${e.start.toString()}`,
      });
      
      setAppointments(newAppointments);
      setDroppedEvent(e as EventInteractionArgs<EventWithId>);
      setIsDropOptionModalOpen(true);
    } catch (err) {
      console.error("Error handling event drop:", err);
      toast.error("Error al mover el turno. Intente nuevamente.");
    }
  };

  const handleMoveEvent = async () => {
    if (!droppedEvent) return;
    
    try {
      const originalApptId = droppedEvent.event.id.split("_")[0];
      
      await fetchData(`/appointments/${originalApptId}`, "PATCH", {
        appointmentDatetime: droppedEvent.start,
        duration: dayjs(droppedEvent.end).diff(
          dayjs(droppedEvent.start),
          "minute"
        ),
      });
      
      await getAppts();
      setIsDropOptionModalOpen(false);
      toast.success("Turno movido con éxito");
    } catch (err) {
      console.error("Error moving event:", err);
      toast.error("Error al mover el turno. Intente nuevamente.");
    }
  };

  const handleMoveToWeekEvent = async (id: string, to: 'prev' | 'next') => {
    try {
      const appt = appointments.find(apt => apt.id === id);
      if (!appt) {
        toast.error("Turno no encontrado");
        return;
      }
      
      const moveTo = to === "prev" 
        ? dayjs(appt.resource.appointmentDatetime).subtract(1, 'week')
        : dayjs(appt.resource.appointmentDatetime).add(1, 'week');
      
      await fetchData(`/appointments/${id}`, "PATCH", {
        appointmentDatetime: moveTo.toISOString()
      });
      
      await getAppts();
      toast.success("Turno movido con éxito");
    } catch (err) {
      console.error("Error moving event to another week:", err);
      toast.error("Error al mover el turno. Intente nuevamente.");
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedAppt) return;
    
    try {
      await fetchData(`/appointments/${selectedAppt}`, "DELETE");
      setIsDeleteApptModalOpen(false);
      await getAppts();
      toast.success("Turno eliminado con éxito");
      setSelectedAppt('');
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("Error al eliminar el turno. Intente nuevamente.");
    }
  };

  const handleDuplicateEvent = async () => {
    if (!droppedEvent) return;
    
    try {
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
      
      // Remove ID to create a new appointment
      delete newAppt.id;
      
      const created = await fetchData("/appointments", "POST", newAppt);
      
      if (created) {
        toast.success("Turno duplicado con éxito");
        await getAppts();
      }
      
      setIsDropOptionModalOpen(false);
    } catch (err) {
      console.error("Error duplicating event:", err);
      toast.error("Error al duplicar el turno. Intente nuevamente.");
    }
  };

  const handleCloseDropOptionModal = () => {
    setIsDropOptionModalOpen(false);
    // Remove temporary events
    setAppointments(
      appointments.filter((appt) => !appt.id.includes("duplicated"))
    );
  };

  // Fetch appointments based on date range
  const getAppts = useCallback(async () => {
    setError(null);
    
    try {
      const appts = await fetchData(
        `/appointments/calendar?start=${apptRangeRef.current.start}&end=${apptRangeRef.current.end}`
      );
      
      // Convert string dates to Date objects
      const apptsWithCorrectedDate = appts.map(
        (appt: Event & { start: string; end: string }) => ({
          ...appt,
          start: new Date(appt.start),
          end: new Date(appt.end),
        })
      );
      
      setAppointments(apptsWithCorrectedDate);
      setIsLoaded(true);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Error al cargar los turnos. Intente nuevamente.");
      setIsLoaded(true);
    }
  }, []); // Only depends on fetchData

  // Initial data load
  useEffect(() => {
    getAppts();
  }, [getAppts]);

  // Get initial values for selected appointment
  const selectedApptInitialValues = useMemo(() => {
    if (selectedAppt === "") return {};
    
    const appt = appointments.find(ap => ap.id === selectedAppt)?.resource;
    if (!appt) return {};
    
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
    };
  }, [selectedAppt, appointments]);

  // Create new appointment from a specific day/time slot
// Create new appointment from a specific day/time slot
const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
  // Set initial values for a new appointment
  setModalInitialValues({
    appointmentDatetime: dayjs(slotInfo.start).format("YYYY-MM-DDTHH:mm"),
    duration: dayjs(slotInfo.end).diff(dayjs(slotInfo.start), "minute")
  });
  // Clear any previous selection (ensuring a new appointment)
  setSelectedAppt('');
  // Open the modal with the new initial values
  setIsAddApptModalOpen(true);
};


  // Current date formatter
  const formatCurrentDate = () => {
    if (calendarView === 'day') {
      return dayjs(currentDate).format('DD MMM, YYYY');
    } else if (calendarView === 'week') {
      const start = dayjs(currentDate).startOf('week').add(1, 'day');
      const end = start.add(6, 'day');
      return `${start.format('DD MMM')} - ${end.format('DD MMM, YYYY')}`;
    } else if (calendarView === 'month') {
      return dayjs(currentDate).format('MMMM YYYY');
    }
    return dayjs(currentDate).format('DD MMM, YYYY');
  };

  // Get icon for calendar view
  const getViewIcon = (view: View) => {
    switch(view) {
      case 'day': return <FaCalendarDay className="mr-1" />;
      case 'week': return <FaCalendarWeek className="mr-1" />;
      case 'month': return <FaCalendarAlt className="mr-1" />;
      case 'agenda': return <FaList className="mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 pt-4 px-4 sm:px-10 bg-background text-foreground">
      {/* Appointment Creation/Edit Modal */}
      <AppointmentModal 
        refetchData={getAppts} 
        open={isAddApptModalOpen} 
        onClose={() => {
          setSelectedAppt('');
          setIsAddApptModalOpen(false);
          setModalInitialValues({})
        }}
        initialValues={selectedAppt ? selectedApptInitialValues : modalInitialValues} 
      />
      
      {/* Appointment Deletion Modal */}
      <DeleteAppointmentModal
        open={isDeleteApptModalOpen}
        onDelete={handleDeleteEvent}
        onClose={() => {
          setSelectedAppt('');
          setIsDeleteApptModalOpen(false);
        }}
      />
      
      {/* Top Actions Bar */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Calendario de Turnos</h2>
        <Button
          iconStart={<BsPlus size={20} />}
          onClick={() => {
            setIsAddApptModalOpen(true);
          }}
        >
          Agregar turno
        </Button>
      </div>
      
      {/* Improved Calendar Controls */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-12 gap-4'} mb-4`}>
        {/* Date Navigation */}
        <div className={`${isMobile ? '' : 'col-span-6'} bg-gray-50 rounded-lg p-3 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button 
                variant="secondary"
                onClick={() => setCurrentDate(new Date())}
                className="flex items-center py-1 px-3"
              >
                <FaCalendarCheck className="mr-1" />
                Hoy
              </Button>
              <div className="flex rounded-md overflow-hidden border border-gray-300">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (calendarView === 'day') {
                      newDate.setDate(newDate.getDate() - 1);
                    } else if (calendarView === 'week') {
                      newDate.setDate(newDate.getDate() - 7);
                    } else if (calendarView === 'month') {
                      newDate.setMonth(newDate.getMonth() - 1);
                    }
                    setCurrentDate(newDate);
                  }}
                  className="py-1 px-2 rounded-none border-r border-gray-300"
                >
                  <FaChevronLeft />
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (calendarView === 'day') {
                      newDate.setDate(newDate.getDate() + 1);
                    } else if (calendarView === 'week') {
                      newDate.setDate(newDate.getDate() + 7);
                    } else if (calendarView === 'month') {
                      newDate.setMonth(newDate.getMonth() + 1);
                    }
                    setCurrentDate(newDate);
                  }}
                  className="py-1 px-2 rounded-none"
                >
                  <FaChevronRight />
                </Button>
              </div>
            </div>
            <div className="font-medium text-center px-4">
              {formatCurrentDate()}
            </div>
          </div>
        </div>
        
        {/* View Selection Controls */}
        <div className={`${isMobile ? '' : 'col-span-6'} bg-gray-50 rounded-lg p-3 shadow-sm`}>
          <div className="flex items-center md:justify-end sm:justify-start">
            {/* View Controls */}
            <div className="flex rounded-md overflow-hidden border border-gray-300">
              {(['day', 'week', 'month', 'agenda'] as View[]).map((view) => (
                <Button
                  key={view}
                  variant={calendarView === view ? "primary" : "secondary"}
                  onClick={() => setCalendarView(view)}
                  className={`py-1 px-3 flex items-center rounded-none ${
                    calendarView === view ? 'bg-primary text-white' : ''
                  } ${
                    view !== 'agenda' ? 'border-r border-gray-300' : ''
                  }`}
                >
                  {getViewIcon(view)}
                  {isMobile ? '' : view === 'day' ? 'Día' : 
                                   view === 'week' ? 'Semana' : 
                                   view === 'month' ? 'Mes' : 'Agenda'}
                </Button>
              ))}
            </div>
            
            {/* Zoom controls removed from here */}
          </div>
        </div>
      </div>
      
      {/* Move/Duplicate Option Modal */}
      <Modal
        title="¿Qué desea hacer?"
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
      
      {/* Loading State */}
      {isLoading && !isLoaded && (
        <div className="flex items-center justify-center h-32">
          <p>Cargando turnos...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center h-32">
          <p className="text-red-500">{error}</p>
          <Button 
            variant="secondary" 
            className="ml-2" 
            onClick={() => getAppts()}
          >
            Reintentar
          </Button>
        </div>
      )}
      
      {/* Calendar Component with Bottom-Right Zoom Controls */}
      <div className="calendar-container">
        <DnDCalendar
          localizer={dayjsLocalizer(dayjs)}
          events={appointments}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          view={calendarView}
          views={['day', 'week', 'month', 'agenda']}
          step={15}
          timeslots={4}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          components={{
            event: (props) => (
              <CustomEvent 
                {...props}
                onMoveToWeek={handleMoveToWeekEvent}
                onDelete={(id: string) => {
                  setSelectedAppt(id);
                  setIsDeleteApptModalOpen(true);
                }}
                onEdit={(id: string) => {
                  setSelectedAppt(id);
                  setIsAddApptModalOpen(true);
                }}
              />
            ),
            // Hide the default toolbar since we're using our custom one
            toolbar: () => null,
          }}
          onView={handleViewChange}
          {...(isMobile ?
            {
              onSelectEvent: (event) => {
                setIsAddApptModalOpen(true);
                setSelectedAppt((event as EventWithId).id);
              }
            } :
            {
              onDoubleClickEvent: (event) => {
                setIsAddApptModalOpen(true);
                setSelectedAppt((event as EventWithId).id);
              }
            })}
          onEventDrop={handleEventDrop}
          onEventResize={(e) => {
            console.log("Event resized:", e);
            // Could implement resizing logic here
          }}
          onRangeChange={handleRangeChange}
          className="w-full h-full" 
          eventPropGetter={(props: any) => ({ 
            style: { 
              background: `${props.resource.professional.colorHex}99`,
              opacity: props.resource.status === 'cancelled' ? 0.5 : 1
            } 
          })}
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
          messages={{
            today: "Hoy",
            previous: "Anterior",
            next: "Siguiente",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            allDay: "Todo el día",
            noEventsInRange: "No hay turnos en este rango de fechas"
          }}
        />
        
        {/* Floating Zoom Controls in Bottom Right */}
        {(calendarView === 'day' || calendarView === 'week') && (
          <div className="zoom-controls-corner">
            <Button 
              variant="secondary"
              onClick={handleZoomOut}
              className="zoom-button-corner mr-2"
              disabled={dayColumnWidth <= MIN_WIDTH}
            >
              <BsDash />
            </Button>
            <div className="flex items-center justify-center text-sm min-w-[40px] text-center">
              {Math.round(dayColumnWidth <= 200 ? (dayColumnWidth - 125) / (200 - 125) * 50 + 50 : (dayColumnWidth - 200) / (200 - 125) * 50 + 100)}
            </div>
            <Button 
              variant="secondary"
              onClick={handleZoomIn}
              className="zoom-button-corner ml-2"
              disabled={dayColumnWidth >= MAX_WIDTH}
            >
              <BsPlus />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;

type CustomEventProps = {
  onMoveToWeek: (id: string, to: 'prev' | 'next') => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  event: Event;
};

const CustomEvent = ({ event, onMoveToWeek, onDelete, onEdit }: CustomEventProps) => {
  const isMobile = useIsMobile();
  const backgroundColor = event.resource.professional.colorHex;
  const isCancelled = event.resource.status === 'cancelled';
  
  // Determine if event has enough height to show all controls
  const [showControls, setShowControls] = useState(false);
  
  // Toggle controls visibility on hover for non-mobile
  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowControls(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (!isMobile) {
      setShowControls(false);
    }
  };

  return (
    <div 
      className={`custom-event-container text-black px-2 pt-1 ${isCancelled ? 'line-through opacity-60' : ''}`} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{borderWidth:'1px', borderColor:`${backgroundColor}`}}
    >
      <div className="rbc-addons-dnd-resizable">
        {/* Event Label (Time) */}
        <div className="flex justify-between pb-1">
          {!showControls && <div className="rbc-event-label-custom ">
            {dayjs(event.start).format("HH:mm")} – {dayjs(event.end).format("HH:mm")}
          </div>}
          
          {/* Controls (always visible on mobile, visible on hover for desktop) */}
          {(!isMobile && showControls) && (
            <div className="flex w-full justify-end items-center">
              <div className="flex w-full justify-end items-center gap-1 pr-1">
                <PiArrowArcLeftBold 
                  size="20"
                  className="hover:bg-black/50 p-1 rounded cursor-pointer" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToWeek((event as EventWithId).id, 'prev');
                  }} 
                />
                <PiArrowArcRightBold 
                  size="20"
                  className="hover:bg-black/50 p-1 rounded cursor-pointer" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToWeek((event as EventWithId).id, 'next');
                  }} 
                />
                <FiEdit
                  size="20"
                  className="hover:bg-black/50 p-1 rounded cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit((event as EventWithId).id);
                  }}
                />
                <FaTrash 
                  size="20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete((event as EventWithId).id);
                  }} 
                  className="hover:text-red-500 p-1 rounded cursor-pointer" 
                />
              </div>
            </div>
          )}
        </div>

        {/* Event Content (Title and Patient Info) */}
        <div className="rbc-event-content" id={event.resource.id}>
          <div className="font-medium">{event.title}</div>
          {/* Add additional patient info if needed */}
          {event.resource.notes && (
            <div className="text-xs truncate max-w-full opacity-90">{event.resource.notes}</div>
          )}
        </div>
      </div>
    </div>
  );
};