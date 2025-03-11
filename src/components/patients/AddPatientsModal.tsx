import { useState, useEffect } from "react";
import { BsPlus } from "react-icons/bs";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import { useFormik } from "formik";
import * as Yup from 'yup';
import useFetch from "@/lib/hooks/useFetch";
import { toast } from "react-toastify";
import { UserPlus, Mail, Phone, Calendar, Edit } from "lucide-react";

type AddPatientModalProps = {
  refetch: () => void;
  patient?: any; // For editing mode
  isEditing?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
};

const AddPatientModal = ({
  refetch,
  patient,
  isEditing = false,
  isOpen: externalIsOpen,
  onClose: externalOnClose
}: AddPatientModalProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { fetchData, loading } = useFetch();

  // Use either external or internal open state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  // Schema for form validation
  const PatientSchema = Yup.object().shape({
    firstname: Yup.string().required('El nombre es obligatorio'),
    lastname: Yup.string().required('El apellido es obligatorio'),
    dateOfBirth: Yup.date().nullable().required('La fecha de nacimiento es obligatoria'),
    phone: Yup.string().nullable(),
    email: Yup.string().email('Email inválido').nullable(),
    dni: Yup.string().nullable(),
  });

  // Initialize form with patient data if editing
  const formik = useFormik({
    initialValues: {
      firstname: '',
      lastname: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      dni: '',
    },
    validationSchema: PatientSchema,
    onSubmit: async (values) => {
      try {
        if (isEditing && patient) {
          await fetchData(`/patients/${patient.id}`, "PATCH", values);
          toast.success("Paciente actualizado con éxito");
        } else {
          await fetchData("/patients", "POST", values);
          toast.success("Paciente creado con éxito");
        }
        formik.resetForm();
        refetch();
        handleClose();
      } catch (error) {
        console.error("Error:", error);
        toast.error(isEditing ? "Error al actualizar el paciente" : "Error al crear el paciente");
      }
    },
  });

  // Update form values when patient prop changes or when editing mode changes
  useEffect(() => {
    if (isEditing && patient) {
      formik.setValues({
        firstname: patient.firstname || '',
        lastname: patient.lastname || '',
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        phone: patient.phone || '',
        email: patient.email || '',
        dni: patient.dni || '',
      });
    } else if (!isEditing) {
      formik.resetForm();
    }
  }, [patient, isEditing]);

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
    formik.resetForm();
  };

  return (
    <>
      {/* Only show button when not controlled externally */}
      {externalIsOpen === undefined && (
        <Button
          iconStart={isEditing ? <Edit size={20} /> : <BsPlus size={20} />}
          className="shadow-sm"
          variant="primary"
          onClick={() => setInternalIsOpen(true)}
        >
          <span className="hidden sm:inline">{isEditing ? "Editar paciente" : "Añadir paciente"}</span>
          <span className="sm:hidden">{isEditing ? "Editar" : "Añadir"}</span>
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isEditing ? "Editar paciente" : "Añadir nuevo paciente"}
      >
        <form
          className="flex flex-col gap-4 p-4"
          onSubmit={formik.handleSubmit}
          noValidate
        >
          {/* Basic Information Section */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex items-center mb-2">
              <UserPlus className="text-primary mr-2" size={18} />
              <h3 className="font-medium text-gray-700">Información personal</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <TextInput
                  name="firstname"
                  placeholder="Ej: Juan"
                  value={formik.values.firstname}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.firstname && formik.errors.firstname && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.firstname}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <TextInput
                  name="lastname"
                  placeholder="Ej: Pérez"
                  value={formik.values.lastname}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.lastname && formik.errors.lastname && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.lastname}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                DNI
              </label>
              <TextInput
                name="dni"
                placeholder="Ej: 12345678"
                value={formik.values.dni || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.dni && formik.errors.dni && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.dni}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Calendar className="mr-1" size={16} />
                Fecha de nacimiento <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={formik.values.dateOfBirth || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.dateOfBirth}</p>
              )}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex items-center mb-2">
              <Phone className="text-primary mr-2" size={18} />
              <h3 className="font-medium text-gray-700">Información de contacto</h3>
            </div>

            <div className="space-y-1">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Phone className="mr-1" size={16} />
                Teléfono
              </label>
              <TextInput
                name="phone"
                placeholder="Ej: +54 11 1234-5678"
                value={formik.values.phone || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.phone}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Mail className="mr-1" size={16} />
                Correo electrónico
              </label>
              <TextInput
                name="email"
                type="email"
                placeholder="Ej: juan.perez@email.com"
                value={formik.values.email || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-2 border-t border-gray-200 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto"
              loading={loading}
              disabled={loading || !formik.isValid}
            >
              {isEditing ? "Actualizar paciente" : "Crear paciente"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddPatientModal;