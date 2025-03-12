import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Professional } from "@/types";
import useFetch from "@/lib/hooks/useFetch";
import { toast } from "react-toastify";
import { AlertTriangle } from "lucide-react";

type DeleteProfessionalModalProps = {
  open: boolean;
  onClose: () => void;
  professional: Professional | null;
  refetch: () => void;
};

const DeleteProfessionalModal = ({
  open,
  onClose,
  professional,
  refetch,
}: DeleteProfessionalModalProps) => {
  const { fetchData } = useFetch();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!professional) return;

    setIsLoading(true);
    try {
      await fetchData(`/professionals/${professional.id}`, "DELETE");
      toast.success("Profesional eliminado exitosamente");
      refetch();
      onClose();
    } catch (error) {
      console.error("Error deleting professional:", error);
      toast.error("Error al eliminar el profesional");
    } finally {
      setIsLoading(false);
    }
  };

  if (!professional) return null;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Eliminar Profesional"
    >
      <div className="p-1">
        <div className="bg-red-50 p-4 rounded-lg mb-4 flex items-start">
          <AlertTriangle className="text-red-600 h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-red-800 mb-1">
              Atención: Esta acción no se puede deshacer
            </h4>
            <p className="text-sm text-red-700">
              Estás a punto de eliminar permanentemente a este profesional. Esto también podría afectar a turnos, órdenes y otros registros asociados.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-base font-medium text-gray-900 mb-2">
            ¿Estás seguro de eliminar este profesional?
          </h3>
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <p className="font-medium text-gray-800">
              {professional.firstname} {professional.lastname}
            </p>
            {professional.email && (
              <p className="text-sm text-gray-600 mt-1">
                {professional.email}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-5">
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProfessionalModal;