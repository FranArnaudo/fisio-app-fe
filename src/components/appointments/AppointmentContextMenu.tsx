import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import AddApointmentModal from "./AddApointmentModal";

const AppointmentContextMenu = () => {
  const [modalToOpen, setModalToOpen] = useState<string | null>(null);
  return (
    <>
      <AddApointmentModal refetchData={() => { }} open={modalToOpen === 'edit'} onClose={() => setModalToOpen(null)} />
      <Modal
        isOpen={modalToOpen === "delete"}
        title={modalToOpen === "edit" ? "Edit" : "¿Querés eliminar el turno?"}
        onClose={() => setModalToOpen(null)}
      >
        <div className="flex gap-2">
          <Button className="w-full" variant="secondary">
            Cancelar
          </Button>
          <Button className="w-full" variant="primary">
            Eliminar turno
          </Button>
        </div> </Modal>

      <ul className="rounded-md">
        <li className="hover:bg-primary w-full h-[40px] flex items-center justify-start pl-2 rounded-t-md cursor-pointer" onClick={() => setModalToOpen("edit")}>
          <span>Editar</span>
        </li>
        <li
          className="hover:bg-destructive hover:text-white flex items-center justify-start w-full pl-2 h-[40px] rounded-b-md cursor-pointer"
          onClick={() => setModalToOpen("delete")}
        >
          <span>Borrar</span>
        </li>
      </ul>
    </>
  );
};

export default AppointmentContextMenu;
