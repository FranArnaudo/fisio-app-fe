import React, { useRef, useEffect, useState } from 'react';
import { Calendar, Clock, FileText, User, CreditCard, Tag, MapPin } from 'lucide-react';
import dayjs from 'dayjs';
import { useInView } from 'react-intersection-observer';
import Button from '@/components/ui/Button';
import { Order } from '@/types';

// Define the Order type based on the backend entity

interface OrderCardProps {
  order: Order;
  onViewFile?: (url: string) => void;
  onChangeStatus?: (id: string, status: string) => void;
}

// Status badge component for visual indication of order status
const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = "";
  
  switch (status.toLowerCase()) {
    case "generada":
      colorClass = "bg-blue-50 text-blue-700 border-blue-100";
      break;
    case "presentado":
      colorClass = "bg-green-50 text-green-700 border-green-100";
      break;
    case "expired":
      colorClass = "bg-red-50 text-red-700 border-red-100";
      break;
    default:
      colorClass = "bg-gray-50 text-gray-700 border-gray-100";
  }
  
  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} border`}>
      {status}
    </div>
  );
};

// Individual Order Card Component
const OrderCard: React.FC<OrderCardProps> = ({ order, onViewFile, onChangeStatus }) => {
  // Format dates with dayjs
  const createdDate = dayjs(order.createdAt).format('DD MMM, YYYY');
  const expiryDate = order.expiresAt ? dayjs(order.expiresAt).format('DD MMM, YYYY') : 'Sin fecha de expiración';
  const submittedDate = order.submittedAt ? dayjs(order.submittedAt).format('DD MMM, YYYY') : null;
  
  const handleViewFile = () => {
    if (order.url && onViewFile) {
      onViewFile(order.url);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onChangeStatus) {
      onChangeStatus(order.id, newStatus);
    }
  };
  
  // Check if order is expired
  const isExpired = order.expiresAt && dayjs(order.expiresAt).isBefore(dayjs());
  
  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg bg-white border border-gray-200 flex-shrink-0 transition-all duration-200 hover:shadow-xl">
      <div className={`h-2 w-full ${isExpired ? 'bg-red-500' : 'bg-primary/80'}`} />
      <div className="p-4">
        {/* Order ID and Date Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <FileText className="text-gray-500 mr-2" size={20} />
            <span className="text-lg font-medium">
              Orden #{order.id.substring(0, 8).toUpperCase()}
            </span>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex items-center mb-4">
          <Calendar className="text-gray-500 mr-2" size={18} />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Creada el</span>
            <span className="text-base">{createdDate}</span>
          </div>
        </div>
        
        {/* Service Info */}
        <div className="flex items-center mb-4">
          <Tag className="text-gray-500 mr-2" size={18} />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Servicio</span>
            <span className="text-base font-medium">{order.service.name}</span>
          </div>
        </div>
        
        {/* Area Info (if exists) */}
        {order.area && (
          <div className="flex items-center mb-4">
            <MapPin className="text-gray-500 mr-2" size={18} />
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Área</span>
              <span className="text-base">{order.area.name}</span>
            </div>
          </div>
        )}
        
        {/* Patient Info */}
        <div className="flex items-center mb-4">
          <User className="text-gray-500 mr-2" size={18} />
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Paciente</span>
            <span className="text-base font-medium">
              {order.patient.firstname} {order.patient.lastname}
            </span>
          </div>
        </div>
        
        {/* Healthcare Info (if exists) */}
        {order.healthcare && (
          <div className="flex items-center mb-4">
            <CreditCard className="text-gray-500 mr-2" size={18} />
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Obra Social</span>
              <span className="text-base">{order.healthcare.name}</span>
            </div>
          </div>
        )}
        
        {/* Submitted Date (if exists) */}
        {submittedDate && (
          <div className="flex items-start mb-4">
            <Calendar className="text-gray-500 mr-2 mt-0.5" size={18} />
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Presentado el</span>
              <span className="text-base">{submittedDate}</span>
            </div>
          </div>
        )}
        
        {/* Expiry Date (if exists) */}
        {order.expiresAt && (
          <div className="flex items-start mb-4">
            <Clock className={`${isExpired ? 'text-red-500' : 'text-gray-500'} mr-2 mt-0.5`} size={18} />
            <div className="flex flex-col">
              <span className={`text-sm ${isExpired ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                {isExpired ? 'Expirada el' : 'Expira el'}
              </span>
              <span className={`text-base ${isExpired ? 'text-red-500 font-medium' : ''}`}>{expiryDate}</span>
            </div>
          </div>
        )}
        
        {/* Notes (if exists) */}
        {order.notes && (
          <div className="mt-4 pt-2 border-t border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Notas</div>
            <p className="text-sm text-gray-700 italic">{order.notes}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
          {order.url && (
            <Button 
              variant="primary" 
              className="w-full sm:w-auto"
              onClick={handleViewFile}
            >
              Ver Documento
            </Button>
          )}
          
          {order.status === 'Generada' && (
            <Button 
              variant="secondary" 
              className="w-full sm:w-auto"
              onClick={() => handleStatusChange('Presentado')}
            >
              Marcar como Presentado
            </Button>
          )}
          
          {order.status === 'Presentado' && !isExpired && (
            <Button 
              variant="secondary" 
              className="w-full sm:w-auto"
              onClick={() => handleStatusChange('Generada')}
            >
              Volver a Generada
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface OrderCardsGridProps {
  orders: Order[];
  onViewFile?: (url: string) => void;
  onChangeStatus?: (id: string, status: string) => void;
}

// Grid component that displays multiple order cards
const OrderCardsGrid: React.FC<OrderCardsGridProps> = ({ orders, onViewFile, onChangeStatus }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<number>(6); // Start with 6 items (2 rows of 3)
  
  // Create groups of 3 orders for mobile view
  const groupedOrders: Order[][] = [];
  for (let i = 0; i < orders.length; i += 3) {
    groupedOrders.push(orders.slice(i, i + 3));
  }
  
  // Setup scroll snapping for mobile
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      // Enable smooth column centering on scroll end
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
    if (inView && visibleItems < orders.length) {
      // Add more items when scrolled to bottom
      setVisibleItems(prev => Math.min(prev + 6, orders.length));
    }
  }, [inView, orders.length, visibleItems]);

  // If no orders, show a message
  if (orders.length === 0) {
    return (
      <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No se encontraron órdenes</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - Horizontal Scroll with Columns of Orders */}
      <div 
        ref={scrollContainerRef}
        className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-6 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {groupedOrders.map((group, groupIndex) => (
          <div 
            key={`group-${groupIndex}`} 
            className="flex-shrink-0 w-full snap-center flex flex-col gap-4"
          >
            {group.map((order) => (
              <div key={order.id} className="w-full">
                <OrderCard 
                  order={order} 
                  onViewFile={onViewFile}
                  onChangeStatus={onChangeStatus}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Desktop View - Vertical Infinite Scroll */}
      <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {orders.slice(0, visibleItems).map((order) => (
          <div key={order.id} className="w-full">
            <OrderCard 
              order={order} 
              onViewFile={onViewFile}
              onChangeStatus={onChangeStatus}
            />
          </div>
        ))}
        
        {/* Lazy loading trigger */}
        {visibleItems < orders.length && (
          <div ref={loadMoreRef} className="col-span-full h-10 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </>
  );
};

export { OrderCard, OrderCardsGrid };