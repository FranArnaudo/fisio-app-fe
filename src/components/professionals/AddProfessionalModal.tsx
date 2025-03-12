import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import TextInput from "../ui/TextInput";
import Select from "../ui/Select";
import { Option } from "@/types";
import useFetch from "@/lib/hooks/useFetch";
import { toast } from "react-toastify";
import { Mail, Phone, User, Palette, MapPin, Lock, UserPlus } from "lucide-react";
import { BsPlus } from "react-icons/bs";

type AddProfessionalModalProps = {
  refetch: () => void;
};

const AddProfessionalModal = ({ refetch }: AddProfessionalModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchData } = useFetch();
  const [areas, setAreas] = useState<Option<string>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch areas for dropdown
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetchData("/areas/dropdown", "GET");
        setAreas(response || []);
      } catch (error) {
        console.error("Error fetching areas:", error);
        toast.error("Error al cargar las áreas");
      }
    };

    if (isOpen) {
      fetchAreas();
    }
  }, [isOpen]);

  // Validation schema
  const validationSchema = Yup.object({
    firstname: Yup.string().required('El nombre es obligatorio'),
    lastname: Yup.string().required('El apellido es obligatorio'),
    username: Yup.string().required('El nombre de usuario es obligatorio'),
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('La contraseña es obligatoria'),
    phone: Yup.string().required('El teléfono es obligatorio'),
    email: Yup.string()
      .email('Ingrese un email válido')
      .required('El email es obligatorio'),
    colorHex: Yup.string().required('El color es obligatorio'),
    areaId: Yup.string().required('El área es obligatoria'),
    adminPassword: Yup.string().required('La contraseña de administrador es obligatoria'),
  });

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      username: "",
      password: "",
      phone: "",
      email: "",
      colorHex: "#3a9ea5",
      areaId: "",
      adminPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await fetchData("/professionals", "POST", values);
        toast.success("Profesional creado exitosamente");
        refetch();
        handleClose();
      } catch (error) {
        console.error("Error creating professional:", error);
        toast.error("Error al crear el profesional");
      } finally {
        setIsLoading(false);
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
        variant="primary"
        onClick={() => setIsOpen(true)}
      >
        <span className="hidden sm:inline">Añadir profesional</span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Añadir Profesional"
      >
        <form onSubmit={formik.handleSubmit} className="space-y-4 py-2">
          <div className="space-y-4">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2 text-primary" />
                Información Personal
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <TextInput
                    name="firstname"
                    placeholder="Ej: Juan"
                    value={formik.values.firstname}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.firstname && formik.errors.firstname ? (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.firstname}</div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Apellido
                  </label>
                  <TextInput
                    name="lastname"
                    placeholder="Ej: Pérez"
                    value={formik.values.lastname}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.lastname && formik.errors.lastname ? (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.lastname}</div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <UserPlus className="w-4 h-4 mr-2 text-primary" />
                Información de Cuenta
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de Usuario
                  </label>
                  <TextInput
                    name="username"
                    placeholder="Ej: jperez"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.username && formik.errors.username ? (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.username}</div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <TextInput
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.password && formik.errors.password ? (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                Información de Contacto
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <TextInput
                    type="email"
                    name="email"
                    placeholder="Ej: juan.perez@ejemplo.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-1 text-gray-500" />
                    Teléfono
                  </label>
                  <TextInput
                    name="phone"
                    placeholder="Ej: 1155667788"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.phone && formik.errors.phone ? (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.phone}</div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Professional Settings Section */}
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Palette className="w-4 h-4 mr-2 text-primary" />
                Configuración Profesional
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                    Área
                  </label>
                  <Select
                    options={areas}
                    placeholder="Seleccionar área"
                    value={formik.values.areaId}
                    onChange={(option) => {
                      formik.setFieldValue("areaId", option.value);
                      formik.setFieldTouched("areaId", true, false);
                    }}
                  />
                  {formik.touched.areaId && formik.errors.areaId ? (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.areaId}</div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Color (para calendario)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      name="colorHex"
                      value={formik.values.colorHex}
                      onChange={formik.handleChange}
                      className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <TextInput
                      name="colorHex"
                      value={formik.values.colorHex}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {formik.touched.colorHex && formik.errors.colorHex ? (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.colorHex}</div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Admin Password Section */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-primary" />
                Autorización
              </h3>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña de Administrador
                </label>
                <TextInput
                  type="password"
                  name="adminPassword"
                  placeholder="Ingrese su contraseña de administrador para confirmar"
                  value={formik.values.adminPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.adminPassword && formik.errors.adminPassword ? (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.adminPassword}</div>
                ) : null}
                <p className="text-xs text-gray-500 mt-1">
                  Se requiere la contraseña de administrador para crear nuevos profesionales.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
              loading={isLoading}
              disabled={isLoading}
            >
              Crear Profesional
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export { AddProfessionalModal };