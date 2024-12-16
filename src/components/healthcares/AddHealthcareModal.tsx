import { BsPlus } from "react-icons/bs";
import Button from "../ui/Button";
import { useState } from "react";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import { useFormik } from "formik";
import Checkbox from "../ui/Checkbox";
import useFetch from "@/lib/hooks/useFetch";
import { toast } from "react-toastify";

const AddHealthcareModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchData } = useFetch();
  const formik = useFormik({
    initialValues: {
      name: "",
      active: false,
    },
    onSubmit: async (values) => {
      const response = await fetchData("/healthcare", "POST", values);

      if (response) {
        toast.success("Obra social creada con éxito");
        formik.resetForm();
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
        iconStart={<BsPlus size={24} />}
        className=""
        variant="primary"
        onClick={() => setIsOpen(true)}
      >
        <span className="hidden sm:inline">Añadir obra social</span>
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <form className="flex flex-col gap-2" onSubmit={formik.handleSubmit}>
          <div>
            <label>Nombre</label>
            <TextInput
              placeholder="Ej. Swiss medical"
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

export default AddHealthcareModal;
