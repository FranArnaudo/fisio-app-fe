import { useState, useEffect } from "react";
import { BsPlus } from "react-icons/bs";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import TextArea from "../ui/TextArea";
import { useFormik } from "formik";
import useFetch from "@/lib/hooks/useFetch";
import { toast } from "react-toastify";
import Select from "../ui/Select";
import { Option } from "@/types";

type AddServiceModalProps = {
  refetch: () => void;
  initialValues?: {
    name?: string;
    description?: string;
    price?: number;
    areaId?: string;
  };
  isEdit?: boolean;
  serviceId?: string;
};

const AddServiceModal = ({
  refetch,
  initialValues = {},
  isEdit = false,
  serviceId
}: AddServiceModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [areas, setAreas] = useState<Option<string>[]>([]);
  const { fetchData } = useFetch();

  const formik = useFormik({
    initialValues: {
      name: initialValues.name || "",
      description: initialValues.description || "",
      price: initialValues.price || 0,
      areaId: initialValues.areaId || "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.name) {
        errors.name = "El nombre es obligatorio";
      }

      if (!values.areaId) {
        errors.areaId = "El área es obligatoria";
      }

      if (values.price < 0) {
        errors.price = "El precio no puede ser negativo";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        if (isEdit && serviceId) {
          await fetchData(`/services/${serviceId}`, "PATCH", values);
          toast.success("Servicio actualizado con éxito");
        } else {
          await fetchData("/services", "POST", values);
          toast.success("Servicio creado con éxito");
        }

        formik.resetForm();
        refetch();
        setIsOpen(false);
      } catch (error) {
        console.error("Error creating/updating service:", error);
        toast.error(isEdit ? "Error al actualizar el servicio" : "Error al crear el servicio");
      }
    },
  });

  // Fetch areas for dropdown
  const fetchAreas = async () => {
    try {
      const areasData = await fetchData("/areas/dropdown", "GET");
      setAreas(areasData);
    } catch (error) {
      console.error("Error fetching areas:", error);
      toast.error("Error al cargar las áreas");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAreas();
    }
  }, [isOpen]);

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
        <span className="hidden sm:inline">
          {isEdit ? "Editar servicio" : "Añadir servicio"}
        </span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEdit ? "Editar servicio" : "Añadir servicio"}
      >
        <form className="flex flex-col gap-4 p-1" onSubmit={formik.handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <TextInput
              placeholder="Ej. Kinesiología"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
            {formik.errors.name && formik.touched.name && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <TextArea
              placeholder="Breve descripción del servicio..."
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio base
            </label>
            <TextInput
              type="number"
              placeholder="0.00"
              name="price"
              value={formik.values.price}
              onChange={formik.handleChange}
              min="0"
              step="0.01"
            />
            {formik.errors.price && formik.touched.price && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="Seleccionar área"
              options={areas}
              value={formik.values.areaId}
              onChange={(option) =>
                formik.setFieldValue("areaId", option.value)
              }
            />
            {formik.errors.areaId && formik.touched.areaId && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.areaId}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4 mt-2 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="w-full"
              type="button"
            >
              Cancelar
            </Button>
            <Button
              className="w-full"
              type="submit"
              disabled={formik.isSubmitting || !formik.isValid}
            >
              {isEdit ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddServiceModal;