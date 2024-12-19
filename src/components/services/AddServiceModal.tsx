import { BsPlus } from "react-icons/bs";
import Button from "../ui/Button";
import { useCallback, useEffect, useState } from "react";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import { useFormik } from "formik";
import useFetch from "@/lib/hooks/useFetch";
import { toast } from "react-toastify";
import Autocomplete from "../ui/Autocomplete";
import { Option } from "@/types";
import TextArea from "../ui/TextArea";

type AddServiceModalProp = {
  refetch: () => void;
};
const AddServiceModal = ({ refetch }: AddServiceModalProp) => {
  const [isOpen, setIsOpen] = useState(false);
  const [areas, setAreas] = useState<Option<string>[]>([]);
  const { fetchData } = useFetch();
  //TODO FIX rerenders 2 times
  const getAreas = useCallback(async () => {
    const response = await fetchData("/areas/dropdown", "GET");
    setAreas(response);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!areas.length) {
      getAreas();
    }
  }, [getAreas, areas.length]);
  const formik = useFormik({
    initialValues: {
      name: "",
      price: null,
      areaId: null,
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.name) {
        errors.name = "El nombre es requerido";
      }
      if (!values.price) {
        errors.price = "El precio es requerido";
      }
      if (!values.areaId) {
        errors.areaId = "El área es requerido";
      }
      return errors;
    },
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { validateForm }) => {
      const errors = await validateForm(values);
      if (Object.keys(errors).length > 0) {
        return;
      }

      const response = await fetchData("/services", "POST", values);

      if (response) {
        toast.success("Servicio creado con éxito");
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
        <span className="hidden sm:inline">Añadir servicio</span>
      </Button>
      <Modal isOpen={isOpen} onClose={handleClose} title="Añadir servicio">
        <form className="flex flex-col gap-2" onSubmit={formik.handleSubmit}>
          <div>
            <label>Nombre</label>
            <TextInput
              placeholder="Ej. Sesión de fisioterapia"
              name="name"
              error={Boolean(formik.errors.name) && formik.touched.name}
              helperText={
                formik.touched.name && Boolean(formik.errors.name)
                  ? formik.errors.name
                  : ""
              }
              onChange={formik.handleChange}
            />
          </div>
          <div>
            <label>Área</label>
            <Autocomplete
              options={areas}
              defaultOptionId={areas[0]?.id}
              name="areaId"
              error={Boolean(formik.errors.areaId) && formik.touched.areaId}
              helperText={formik.touched.areaId ? formik.errors.areaId : ""}
              onChange={(option: any) =>
                formik.handleChange({
                  target: { name: "areaId", value: option.value },
                })
              }
            />
          </div>
          <div>
            <label>Precio</label>
            <TextInput
              placeholder="Ej. 15000"
              type="number"
              error={Boolean(formik.errors.price) && formik.touched.price}
              helperText={
                formik.touched.price && Boolean(formik.errors.price)
                  ? formik.errors.price
                  : ""
              }
              name="price"
              onChange={formik.handleChange}
            />
          </div>
          <div>
            <label>Descripción</label>
            <TextArea
              placeholder="Ej. Sesion regular de fisioterapia"
              name="description"
              onChange={formik.handleChange}
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
            <Button className="w-full" type="submit" disabled={!formik.isValid}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddServiceModal;
