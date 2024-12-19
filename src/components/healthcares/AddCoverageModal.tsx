import { BsPlus } from "react-icons/bs";
import Button from "../ui/Button";
import { useCallback, useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { useFormik } from "formik";
import useFetch from "@/lib/hooks/useFetch";
import { toast } from "react-toastify";
import Autocomplete from "../ui/Autocomplete";
import TextInput from "../ui/TextInput";

type AddCoverageModalProps = { refetch: () => void; healthcareId: string };
const AddCoverageModal = ({ refetch, healthcareId }: AddCoverageModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [services, setServices] = useState([]);
  const { fetchData, fetched } = useFetch();
  const formik = useFormik({
    initialValues: {
      name: "",
      amount: null,
      copay: 0,
    },
    onSubmit: async (values) => {
      const response = await fetchData("/healthcare", "POST", values);

      if (response) {
        toast.success("Cobertura creada con éxito");
        formik.resetForm();
        refetch();
        setIsOpen(false);
      }
    },
  });

  const serviceOptions = useCallback(async () => {
    const response = await fetchData(
      `/services/dropdown/${healthcareId}`,
      "GET"
    );
    setServices(response);
  }, []);

  useEffect(() => {
    if (!fetched) {
      serviceOptions();
    }
  }, [serviceOptions, fetched]);
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
        <span className="hidden sm:inline">Añadir cobertura</span>
      </Button>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={handleClose} title="Añadir cobertura">
          <form className="flex flex-col gap-2" onSubmit={formik.handleSubmit}>
            <div>
              <label>Servicio</label>
              <Autocomplete
                options={services}
                placeholder="Ej. Sesión fisiokinésica"
                name="service"
                onChange={(value) => {
                  formik.handleChange({
                    target: { name: "service", value: value },
                  });
                }}
              />
            </div>
            <div>
              <label>Monto de cobertura</label>
              <TextInput
                type="number"
                name="amount"
                onChange={formik.handleChange}
                value={formik.values.amount}
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
      )}
    </>
  );
};

export default AddCoverageModal;
