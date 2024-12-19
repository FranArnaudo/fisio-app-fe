import { BsPlus } from "react-icons/bs";
import Button from "../ui/Button";
import { useState } from "react";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import { useFormik } from "formik";
import Checkbox from "../ui/Checkbox";
import useFetch from "@/lib/hooks/useFetch";
import { toast } from "react-toastify";

type AddAreaModalProp = {
  refetch: () => void;
};
const AddAreaModal = ({ refetch }: AddAreaModalProp) => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchData } = useFetch();
  const formik = useFormik({
    initialValues: {
      name: "",
      active: false,
    },
    onSubmit: async (values) => {
      const response = await fetchData("/areas", "POST", values);

      if (response) {
        toast.success("Área creada con éxito");
        formik.resetForm();
        refetch();
        setIsOpen(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setIsOpen(false);
  };
  return (
    <>
      <Button
        iconStart={<BsPlus size={22} />}
        className=""
        variant="primary"
        onClick={() => setIsOpen(true)}
      >
        <span className="hidden sm:inline">Añadir área</span>
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose} title="Añadir área">
        <form className="flex flex-col gap-2" onSubmit={formik.handleSubmit}>
          <div>
            <label>Nombre</label>
            <TextInput
              placeholder="Ej. Kinesiología"
              name="name"
              onChange={formik.handleChange}
            />
          </div>
          <div>
            <Checkbox
              label="Activo"
              onChange={(value: boolean) =>
                formik.handleChange({ target: { name: "active", value } })
              }
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2 ">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="w-full"
            >
              Cancelar
            </Button>
            <Button className="w-full" type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddAreaModal;
