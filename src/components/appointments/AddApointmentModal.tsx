import { useFormik } from "formik";
import Select from "../ui/Select";
import TextInput from "../ui/TextInput";
import dayjs from "dayjs";
import useFetch from "@/lib/hooks/useFetch";
import { Option } from "@/types";
import { useCallback, useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { BsPlus } from "react-icons/bs";
import Button from "../ui/Button";
import TextArea from "../ui/TextArea";
import { toast } from "react-toastify";
import Autocomplete from "../ui/Autocomplete";

type AddApointmentModalProps = {
  refetchData: () => void;
  open: boolean;
  id?: string | null;
  onClose: () => void;
};
const AddApointmentModal = ({ refetchData, open, id, onClose }: AddApointmentModalProps) => {
  console.log("🚀 ~ AddApointmentModal ~ id:", id)
  const { fetchData } = useFetch();
  const [isAddingNewPatient, setIsAddingNewPatient] = useState(false);
  const [professionals, setProfessionals] = useState<Option<string>[]>([]);
  const [patients, setPatients] = useState<Option<string>[]>([]);

  const getAppt = useCallback(async () => {
    if (!id) return
    const appt = await fetchData(`/appointments/${id}`, "GET");
    formik.setValues({
      appointmentDatetime: dayjs(appt.appointmentDatetime).format("YYYY-MM-DDTHH:mm"),
      status: appt.status,
      duration: appt.duration,
      professional: appt.professional.id,
      patient: appt.patient.id,
      patientFirstname: appt.patient.firstname,
      patientLastname: appt.patient.lastname,
      patientPhone: appt.patient.phone,
      notes: appt.notes,
    });
  }, [id, fetchData]);
  useEffect(() => {
    if (id) {
      getAppt()
    }
  }, [getAppt])
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
        duration: Number(values.duration),
        patient,
      });
      if (createdAppt) {
        toast.success("Turno creado con éxito");
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
    setPatients(patientsResponse);
    setProfessionals(proffesionalsResponse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getDropdownData();
  }, [getDropdownData]);
  return (
    <>
      <Modal
        isOpen={open}
        title="Agregar turno"
        onClose={onClose}
      >
        <form className="flex flex-col gap-2" onSubmit={formik.handleSubmit}>
          <div>
            <label>Fecha y hora</label>
            <TextInput
              type="datetime-local"
              name="appointmentDatetime"
              onChange={formik.handleChange}
              value={formik.values.appointmentDatetime}
            />
          </div>
          <div>
            <label>Duración en minutos</label>
            <TextInput
              name="duration"
              onChange={formik.handleChange}
              value={formik.values.duration}
            />
          </div>
          <div>
            <label>Estado</label>
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
          </div>
          <div>
            <label>Profesional</label>
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
          <div
            className={`shadow-xl p-2 rounded-md  ${isAddingNewPatient ? "" : "sm:shadow-none sm:p-0 sm:rounded-none"
              }`}
          >
            {!isAddingNewPatient ? (
              <>
                <label>Paciente</label>
                <div className="flex gap-2 flex-col sm:flex-row ">
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

                  <Button onClick={() => setIsAddingNewPatient(true)}>
                    Nuevo
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2  mt-2 flex-col p-2 sm:p-0 ">
                <label>Nombre del paciente</label>
                <TextInput
                  name="patientFirstname"
                  placeholder="Ej: Juan"
                  onChange={formik.handleChange}
                  value={formik.values.patientFirstname}
                />
                <label>Apellido del paciente</label>
                <TextInput
                  placeholder="Ej: Perez"
                  name="patientLastname"
                  onChange={formik.handleChange}
                  value={formik.values.patientLastname}
                />
                <label>Teléfono (opcional)</label>
                <TextInput
                  placeholder="Ej: 35312345677"
                  name="patientPhone"
                  onChange={formik.handleChange}
                  value={formik.values.patientPhone}
                />
                <Button onClick={() => setIsAddingNewPatient(false)}>
                  Cancelar
                </Button>
              </div>
            )}
            <div>
              <input type="checkbox" />
              <label>Orden</label>
            </div>
          </div>
          <div>
            <label>Notas</label>
            <TextArea
              name="notes"
              placeholder="Ej: Urgente"
              onChange={formik.handleChange}
              value={formik.values.notes}
            />
          </div>
          <div className="flex w-full flex-col sm:flex-row gap-2">
            <Button variant="secondary" className="w-full">
              Cancelar
            </Button>
            <Button type="submit" className="w-full">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddApointmentModal;
