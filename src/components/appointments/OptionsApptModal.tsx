import { useState } from "react";
import Button from "../ui/Button";
import Datepicker from "../ui/Datepicker";
import Modal, { ModalProps } from "../ui/Modal";
import Radio from "../ui/Radio";
type OptionsApptModalProps = ModalProps & {
  [x: string]: any;
};
const OptionsApptModal = ({ ...props }: OptionsApptModalProps) => {
  const [moveOrCopy, setMoveOrCopy] = useState<"move" | "copy">("move");
  return (
    <Modal {...props}>
      <div className="flex flex-col gap-2">
        <Datepicker />
        <div className="flex gap-2"></div>
        <div className="flex gap-2 w-full">
          <Button className="w-full">Aplicar</Button>
          <Button className="w-full" onClick={props.onClose} variant="danger">
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OptionsApptModal;
