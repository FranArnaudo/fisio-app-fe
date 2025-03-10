import React, { useRef, useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { Appointment } from '@/types';


interface AppointmentCardProps {
  appointment: Appointment;
}

interface AppointmentCardsGridProps {
  appointments: Appointment[];
}

// Individual Appointment Card Component
const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  // Custom function to capitalize day and month
  const formatDateCapitalized = (date: string|Date): string => {
    const formatted = dayjs(date).format('dddd DD [de] MMMM');
    const parts = formatted.split(' ');
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    parts[3] = parts[3].charAt(0).toUpperCase() + parts[3].slice(1);
    return parts.join(' ');
  };

  // Calculate end time based on start time and duration
  const startTime = dayjs(appointment.appointmentDatetime);
  const endTime = startTime.add(appointment.duration, 'minute');

  // Format times
  const startTimeFormatted = startTime.format('HH:mm');
  const endTimeFormatted = endTime.format('HH:mm');

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg bg-white border border-gray-200 flex-shrink-0">
      <div 
        className="h-2 w-full" 
      />
      <div className="p-4">
        {/* Date Section */}
        <div className="flex items-center mb-3">
          <Calendar className="text-gray-500 mr-2" size={20} />
          <span className="text-lg font-medium">
            {formatDateCapitalized(appointment.appointmentDatetime)}
          </span>
        </div>
        
        {/* Time Section */}
        <div className="flex items-center mb-4">
          <Clock className="text-gray-500 mr-2" size={20} />
          <span className="text-lg">
            {startTimeFormatted} - {endTimeFormatted} hrs
          </span>
        </div>
        
        {/* Professional Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">Profesional</div>
          <div className="text-lg font-medium">
            {appointment.professional.firstname} {appointment.professional.lastname}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="mt-4">
          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold rounded">
            {appointment.status}
          </span>
        </div>
      </div>
    </div>
  );
};

import { useInView } from 'react-intersection-observer'; 

const AppointmentCardsGrid: React.FC<AppointmentCardsGridProps> = ({ appointments }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<number>(9); // Start with 9 items (3 rows)
  
  // Create groups of 3 appointments for mobile view
  const groupedAppointments: Appointment[][] = [];
  for (let i = 0; i < appointments.length; i += 3) {
    groupedAppointments.push(appointments.slice(i, i + 3));
  }
  
  // Setup scroll snapping for mobile
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      // This enables smooth column centering on scroll end
      const handleScrollEnd = () => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const clientWidth = container.clientWidth;
        const scrollLeft = container.scrollLeft;
        
        // Calculate the index of the column to snap to
        const columnWidth = clientWidth;
        const index = Math.round(scrollLeft / columnWidth);
        
        // Smoothly scroll to the calculated position
        container.scrollTo({
          left: index * columnWidth,
          behavior: 'smooth'
        });
      };
      
      // Debounce the scroll end handling
      clearTimeout((scrollContainerRef.current as any).scrollTimeout as any);
      (scrollContainerRef.current as any).scrollTimeout = setTimeout(handleScrollEnd, 150);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        clearTimeout((container as any).scrollTimeout);
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  
  // Setup intersection observer for lazy loading on desktop
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    triggerOnce: false
  });
  
  // Load more items when the load more trigger comes into view
  useEffect(() => {
    if (inView && visibleItems < appointments.length) {
      // Add more items when scrolled to bottom
      setVisibleItems(prev => Math.min(prev + 6, appointments.length));
    }
  }, [inView, appointments.length, visibleItems]);

  return (
    <>
      {/* Mobile View - Horizontal Scroll with Columns of 3 */}
      <div 
        ref={scrollContainerRef}
        className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-6 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {groupedAppointments.map((group, groupIndex) => (
          <div 
            key={`group-${groupIndex}`} 
            className="flex-shrink-0 w-full snap-center flex flex-col gap-4"
          >
            {group.map((appointment) => (
              <div key={appointment.id} className="w-full">
                <AppointmentCard appointment={appointment} />
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Desktop View - Vertical Infinite Scroll */}
      <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {appointments.slice(0, visibleItems).map((appointment) => (
          <div key={appointment.id} className="w-full">
            <AppointmentCard appointment={appointment} />
          </div>
        ))}
        
        {/* Lazy loading trigger */}
        {visibleItems < appointments.length && (
          <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </>
  );
};

export { AppointmentCardsGrid };