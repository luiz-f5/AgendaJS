import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { Appointment } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import ConfirmDialog from "../../components/confirmDialog";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{ id: number; status: string } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) return;
    apiRequest<Appointment[]>("/appointments/history/doctor", "GET", undefined, token).then(setAppointments);
  }, [token]);

  async function updateAppointmentStatus(id: number, status: "confirmada" | "concluida" | "cancelada") {
    try {
      await apiRequest(`/appointments/${id}/status`, "PATCH", { status }, token!);
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
      showToast(`Consulta ${status}!`, "success");
    } catch {
      showToast("Erro ao atualizar consulta!", "danger");
    }
  }

  return (
    <div className="page">
      <h2>Minhas Consultas</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
            <th>Hora</th>
            <th>Paciente</th>
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
              <td>{a.patient?.name}</td>
              <td>{a.status}</td>
              <td>
                {(a.status === "agendada" || a.status === "confirmada") && (
                  <>
                    {a.status === "agendada" && (
                      <button className="btn success" onClick={() => updateAppointmentStatus(a.id, "confirmada")}>
                        Confirmar
                      </button>
                    )}
                    <button className="btn success" onClick={() => updateAppointmentStatus(a.id, "concluida")}>
                      Concluir
                    </button>
                    <button className="btn danger" onClick={() => setConfirmDialog({ id: a.id, status: "cancelada" })}>
                      Cancelar
                    </button>
                  </>
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
            updateAppointmentStatus(confirmDialog.id, "cancelada");
            setConfirmDialog(null);
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
