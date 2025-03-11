import React, { useState, useEffect } from 'react';
import { OrderCardsGrid } from '@/components/orders/OrdersShortCard';
import { FileText, Plus, X, Calendar, Tag, CreditCard, Clock, FileUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import { Healthcare, Order, Service } from '@/types';
import useFetch from '@/lib/hooks/useFetch';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

interface OrdersTabProps {
  patientId: string;
  orders: Order[];
  onOrdersUpdate: () => void;
}

const OrdersTabWithForm: React.FC<OrdersTabProps> = ({ patientId, orders, onOrdersUpdate }) => {
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [healthcares, setHealthcares] = useState<{ id: string, text: string, value: string }[]>([]);
  const [services, setServices] = useState<{ id: string, text: string, value: string }[]>([]);
  const [selectedHealthcare, setSelectedHealthcare] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchData } = useFetch();

  // Fetch healthcare and service options when form is opened
  useEffect(() => {
    if (isAddingOrder) {
      fetchHealthcares();
    }
  }, [isAddingOrder]);

  // Fetch services when healthcare is selected
  useEffect(() => {
    if (selectedHealthcare) {
      fetchServices(selectedHealthcare);
    } else {
      setServices([]);
    }
  }, [selectedHealthcare]);

  const fetchHealthcares = async () => {
    try {
      const data = await fetchData('/healthcare/dropdown', 'GET');
      setHealthcares(data || []);
    } catch (error) {
      console.error('Error fetching healthcares:', error);
      toast.error('No se pudieron cargar las obras sociales');
    }
  };

  const fetchServices = async (healthcareId: string) => {
    try {
      const data = await fetchData(`/services/dropdown/${healthcareId}`, 'GET');
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('No se pudieron cargar los servicios');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedHealthcare || !selectedService) {
      toast.warning('Por favor seleccione obra social y servicio');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderData = {
        patient: patientId,
        healthcare: selectedHealthcare,
        service: selectedService,
        notes: notes || undefined,
        expiresAt: expiryDate || undefined
      };

      await fetchData('/orders', 'POST', orderData);
      toast.success('Orden creada exitosamente');

      // Reset form and fetch updated orders
      setIsAddingOrder(false);
      resetForm();
      onOrdersUpdate();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear la orden');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedHealthcare('');
    setSelectedService('');
    setNotes('');
    setExpiryDate('');
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header with add button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <FileText className="mr-2 h-5 w-5 text-primary" />
          Órdenes del paciente
        </h3>
        <Button
          variant={isAddingOrder ? "ghost" : "primary"}
          size="sm"
          onClick={() => setIsAddingOrder(!isAddingOrder)}
          iconStart={isAddingOrder ? <X size={18} /> : <Plus size={18} />}
        >
          {isAddingOrder ? 'Cancelar' : 'Nueva orden'}
        </Button>
      </div>

      {/* Add order form */}
      {isAddingOrder && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6 transition-all duration-300 ease-in-out">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">Nueva orden médica</h4>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Healthcare select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                Obra social
              </label>
              <Select
                placeholder="Seleccionar obra social"
                options={healthcares}
                onChange={(option) => setSelectedHealthcare(option.value)}
                value={selectedHealthcare}
              />
            </div>

            {/* Service select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Tag className="h-4 w-4 mr-1 text-gray-500" />
                Servicio
              </label>
              <Select
                placeholder={selectedHealthcare ? "Seleccionar servicio" : "Primero seleccione obra social"}
                options={services}
                onChange={(option) => setSelectedService(option.value)}
                value={selectedService}
              // disabled={!selectedHealthcare || services.length === 0}
              />
            </div>

            {/* Expiry date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                Fecha de expiración (opcional)
              </label>
              <TextInput
                type="date"
                min={dayjs().format('YYYY-MM-DD')}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <TextArea
                placeholder="Ej: Urgente, control mensual, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setIsAddingOrder(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={isSubmitting}
                disabled={isSubmitting || !selectedHealthcare || !selectedService}
              >
                Crear orden
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Orders grid */}
      {orders.length > 0 ? (
        <OrderCardsGrid orders={orders} />
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay órdenes</h3>
          <p className="text-gray-500 mb-4">
            Este paciente no tiene órdenes médicas registradas.
          </p>
          {!isAddingOrder && (
            <Button
              variant="primary"
              onClick={() => setIsAddingOrder(true)}
              iconStart={<Plus size={18} />}
            >
              Crear primera orden
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersTabWithForm;