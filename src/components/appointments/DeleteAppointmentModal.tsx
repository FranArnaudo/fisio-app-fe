import Button from "../ui/Button";
import Modal from "../ui/Modal";

type DeleteAppointmentModalProps = {
    open: boolean;
    onClose : ()=>void;
    onDelete: ()=>void
}
const DeleteAppointmentModal = ({ open, onClose, onDelete }: DeleteAppointmentModalProps) => {
  return (
    <Modal isOpen={open} title="Eliminar turno" onClose={onClose}>
      <div className="p-4">
        <p className="mb-4 text-center">
          ¿Estás seguro de que deseas eliminar este turno?
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" className="w-full" onClick={onDelete}>
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteAppointmentModal;
