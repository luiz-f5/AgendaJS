import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { User, Schedule, Appointment, Specialty } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import ConfirmDialog from "../../components/confirmDialog";

export default function PatientAppointmentsPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [date, setDate] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ id: number } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) return;
    apiRequest<Specialty[]>("/specialties", "GET", undefined, token).then(setSpecialties);
    apiRequest<Appointment[]>("/appointments/history/patient", "GET", undefined, token).then(setAppointments);
  }, [token]);

  useEffect(() => {
    if (!token || !specialtyId) return;
    apiRequest<User[]>(`/users/doctors?specialtyId=${specialtyId}`, "GET", undefined, token).then(setDoctors);
    setDoctorId(null);
  }, [specialtyId]);

  useEffect(() => {
    if (!token || !doctorId) return;
    apiRequest<Schedule[]>(`/schedules/${doctorId}`, "GET", undefined, token).then(setSchedules);
  }, [doctorId]);

  async function book(hour: string) {
    try {
      if (!doctorId || !specialtyId || !date || !hour) {
        showToast("Selecione especialidade, médico, data e horário", "danger");
        return;
      }
      await apiRequest("/appointments", "POST", { specialtyId, doctorId, date, hour }, token!);
      showToast("Consulta marcada!", "success");
      const updated = await apiRequest<Appointment[]>("/appointments/history/patient", "GET", undefined, token!);
      setAppointments(updated);
    } catch {
      showToast("Erro ao marcar consulta!", "danger");
    }
  }

  async function cancelAppointment(id: number) {
    try {
      await apiRequest(`/appointments/${id}/status`, "PATCH", { status: "cancelada" }, token!);
      showToast("Consulta cancelada!", "success");
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: "cancelada" } : a));
    } catch {
      showToast("Erro ao cancelar consulta!", "danger");
    }
  }

  return (
    <div className="page">
      <h2>Agendamento & Histórico de Consultas</h2>

      <h3>Agendar Consulta</h3>
      <select onChange={e => setSpecialtyId(Number(e.target.value))}>
        <option value="">Selecione uma especialidade</option>
        {specialties.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {specialtyId && (
        <select onChange={e => setDoctorId(Number(e.target.value))}>
          <option value="">Selecione um médico</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.specialty?.name})
            </option>
          ))}
        </select>
      )}

      {doctorId && (
        <>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
          <ul>
            {schedules.map(s => (
              <li key={s.id}>
                {s.hour}
                <button className="btn success" onClick={() => book(s.hour)}>Agendar</button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3>Histórico de Consultas</h3>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
            <th>Hora</th>
            <th>Médico</th>
            <th>Especialidade</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.date}</td>
              <td>{a.hour}</td>
              <td>{a.doctor?.name}</td>
              <td>{a.doctor?.specialty?.name}</td>
              <td>{a.status}</td>
              <td>
                {(a.status === "agendada" || a.status === "confirmada") && (
                  <button className="btn danger" onClick={() => setConfirmDialog({ id: a.id })}>Cancelar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {confirmDialog && (
        <ConfirmDialog
          title="Confirmar Cancelamento"
          message="Tem certeza que deseja cancelar esta consulta?"
          onConfirm={() => {
            cancelAppointment(confirmDialog.id);
            setConfirmDialog(null);
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
