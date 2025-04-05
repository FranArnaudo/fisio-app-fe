import { useFormik } from "formik";
import Select from "../ui/Select";
import TextInput from "../ui/TextInput";
import dayjs from "dayjs";
import useFetch from "@/lib/hooks/useFetch";
import { Option } from "@/types";
import { useCallback, useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { toast } from "react-toastify";
import Autocomplete from "../ui/Autocomplete";
import { jwtDecode } from "jwt-decode";
import { Calendar, Clock, Users, UserPlus, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Status badge component for visual indication of appointment status
const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = "";
  let Icon = null;

  switch (status) {
    case "Programado":
      colorClass = "bg-blue-50 text-blue-700 border-blue-100";
      Icon = CheckCircle;
      break;
    case "Realizado":
      colorClass = "bg-green-50 text-green-700 border-green-100";
      Icon = CheckCircle;
      break;
    case "Cancelado":
      colorClass = "bg-red-50 text-red-700 border-red-100";
      Icon = XCircle;
      break;
    default:
      colorClass = "bg-gray-50 text-gray-700 border-gray-100";
      Icon = AlertCircle;
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} border`}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {status}
    </div>
  );
};

type AppointmentModalProps = {
  refetchData: () => void;
  open: boolean;
  initialValues?: any;
  onClose: () => void;
};

const AppointmentModal = ({ refetchData, open, initialValues = {}, onClose }: AppointmentModalProps) => {
  const { fetchData } = useFetch();
  const decodedJWT = jwtDecode(localStorage.getItem("jwt_token") as string);

  const [isAddingNewPatient, setIsAddingNewPatient] = useState(false);
  const [professionals, setProfessionals] = useState<Option<string>[]>([]);
  const [patients, setPatients] = useState<Option<string>[]>([]);

  useEffect(() => {
    if (Object.keys(initialValues).length) {
      formik.setValues(initialValues);
    } else {
      formik.resetForm();
    }
  }, [initialValues]);

  const formik = useFormik({
    initialValues: {
      appointmentDatetime: dayjs().format("YYYY-MM-DDTHH:mm"),
      status: "Programado",
      duration: 60,
      professional: "",
      patient: "",
      patientFirstname: "",
      patientLastname: "",
      patientPhone: "",
      notes: "",
      createdBy: (decodedJWT as any).id
    },
    onSubmit: async (values) => {
      let patient;
      if (isAddingNewPatient) {
        const createdPatient = await fetchData("/patients", "POST", {
          firstname: values.patientFirstname,
          lastname: values.patientLastname,
          phone: values.patientPhone,
        });
        patient = createdPatient.id;
      } else {
        patient = values.patient;
      }

      const createdAppt = await fetchData("/appointments", "POST", {
        ...values,
        createdBy: (decodedJWT as any).id,
        duration: Number(values.duration),
        patient,
      });
      if (createdAppt) {
        toast.success("Turno creado con éxito");
        refetchData();
        onClose();
      }
    },
  });

  const getDropdownData = useCallback(async () => {
    const proffesionalsResponse = await fetchData(
      "/professionals/dropdown",
      "GET"
    );
    const patientsResponse = await fetchData("/patients/dropdown", "GET");
    console.log("🚀 ~ getDropdownData ~ patientsResponse:", patientsResponse)
    setPatients(patientsResponse);
    setProfessionals(proffesionalsResponse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getDropdownData();
  }, [getDropdownData]);

  return (
    <Modal
      isOpen={open}
      title={Object.keys(initialValues).length ? "Editar turno" : "Añadir turno"}
      onClose={onClose}
    >
      <form className="flex flex-col gap-4 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1" onSubmit={formik.handleSubmit}>
        {/* Date, Time and Duration section */}
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            Detalles del turno
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Fecha y hora</label>
              <TextInput
                type="datetime-local"
                name="appointmentDatetime"
                onChange={formik.handleChange}
                value={formik.values.appointmentDatetime}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Duración en minutos</label>
              <div className="relative">
                <TextInput
                  name="duration"
                  onChange={formik.handleChange}
                  value={formik.values.duration}
                />
                <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Status and Professional section */}
        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <div className="grid grid-cols-1 gap-2 justify-center items-center ">
                <Select
                  options={[
                    { text: "Programado", value: "Programado", id: "Programado" },
                    { text: "Cancelado", value: "Cancelado", id: "Cancelado" },
                    { text: "Realizado", value: "Realizado", id: "Realizado" },
                  ]}
                  onChange={(option: any) =>
                    formik.handleChange({
                      target: { name: "status", value: option.value },
                    })
                  }
                  value={formik.values.status}
                />
                <StatusBadge status={formik.values.status} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Profesional</label>
              <Select
                placeholder="Selecciona un profesional"
                options={professionals}
                onChange={(option: any) =>
                  formik.handleChange({
                    target: { name: "professional", value: option.value },
                  })
                }
                value={formik.values.professional}
              />
            </div>
          </div>
        </div>

        {/* Patient section */}
        <div className={`bg-white rounded-md border border-gray-200 transition-all duration-200 ${isAddingNewPatient ? "shadow-lg" : "shadow-sm"
          }`}>
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2 text-primary" />
              Información del paciente
            </h4>

            {!isAddingNewPatient ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Paciente</label>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <div className="flex-1">
                    <Autocomplete
                      placeholder="Selecciona un paciente"
                      options={patients}
                      onChange={(option: any) =>
                        formik.handleChange({
                          target: { name: "patient", value: option.value },
                        })
                      }
                      value={formik.values.patient}
                    />
                  </div>
                  <Button
                    onClick={() => setIsAddingNewPatient(true)}
                    iconStart={<UserPlus size={16} />}
                  >
                    Nuevo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nombre del paciente</label>
                  <TextInput
                    name="patientFirstname"
                    placeholder="Ej: Juan"
                    onChange={formik.handleChange}
                    value={formik.values.patientFirstname}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Apellido del paciente</label>
                  <TextInput
                    placeholder="Ej: Perez"
                    name="patientLastname"
                    onChange={formik.handleChange}
                    value={formik.values.patientLastname}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Teléfono (opcional)</label>
                  <TextInput
                    placeholder="Ej: 35312345677"
                    name="patientPhone"
                    onChange={formik.handleChange}
                    value={formik.values.patientPhone}
                  />
                </div>

                <Button
                  onClick={() => setIsAddingNewPatient(false)}
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </div>
            )}

            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="has-order"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="has-order" className="ml-2 block text-sm text-gray-700">
                Orden
              </label>
            </div>
          </div>
        </div>

        {/* Notes section */}
        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-primary" />
              Notas
            </label>
            <textarea
              name="notes"
              placeholder="Ej: Urgente"
              onChange={formik.handleChange}
              value={formik.values.notes}
              className="
                w-full
                rounded-md
                border border-gray-300
                bg-white
                py-2 px-3
                text-sm text-gray-700
                focus:outline-none
                focus:border-primary
                focus:ring-1 focus:ring-primary
                placeholder-gray-400
                min-h-24
                resize-y
              "
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex w-full flex-col sm:flex-row gap-2 mt-2">
          <Button
            variant="secondary"
            className="w-full"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-full"
          >
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentModal;