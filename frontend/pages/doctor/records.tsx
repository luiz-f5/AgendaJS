import { useEffect, useState } from "react";
import { apiRequest, API_URL } from "../../lib/api";
import { Appointment, MedicalFile, User } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import ConfirmDialog from "../../components/confirmDialog";

export default function DoctorRecordsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [fileForm, setFileForm] = useState<{ patientId: number; pdf?: File }>({ patientId: 0 });
  const [confirmDialog, setConfirmDialog] = useState<{ id: number; status: string } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const doctorId = typeof window !== "undefined" ? Number(localStorage.getItem("userId")) : null;
  const { showToast } = useToast();

  useEffect(() => {
    if (!token || !doctorId) return;
    apiRequest<Appointment[]>("/appointments/history/doctor", "GET", undefined, token).then(setAppointments);
    apiRequest<User[]>("/users/patients", "GET", undefined, token).then(setPatients);
    apiRequest<MedicalFile[]>(`/files/sent/${doctorId}`, "GET", undefined, token).then(setFiles);
  }, [token, doctorId]);

  async function updateAppointmentStatus(id: number, status: "confirmada" | "concluida" | "cancelada") {
    try {
      await apiRequest(`/appointments/${id}/status`, "PATCH", { status }, token!);
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
      showToast(`Consulta ${status}!`, "success");
    } catch {
      showToast("Erro ao atualizar consulta!", "danger");
    }
  }

  async function sendFile() {
    try {
      if (!fileForm.pdf || !fileForm.patientId) {
        showToast("Selecione paciente e arquivo PDF", "danger");
        return;
      }
      const formData = new FormData();
      formData.append("pdf", fileForm.pdf);
      formData.append("patientId", String(fileForm.patientId));

      await fetch(`${API_URL}/files/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      showToast("Laudo enviado!", "success");
      const updated = await apiRequest<MedicalFile[]>(`/files/sent/${doctorId}`, "GET", undefined, token!);
      setFiles(updated);
      setFileForm({ patientId: 0 });
    } catch {
      showToast("Erro ao enviar laudo!", "danger");
    }
  }

  return (
    <div className="page">
      <h2>Consultas e Laudos</h2>
      <h3>Minhas Consultas</h3>
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
          {appointments.map((a, index) => (
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
                      <button
                        className="btn success"
                        onClick={() => updateAppointmentStatus(a.id, "confirmada")}
                      >
                        Confirmar
                      </button>
                    )}
                    <button
                      className="btn success"
                      onClick={() => updateAppointmentStatus(a.id, "concluida")}
                    >
                      Concluir
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => setConfirmDialog({ id: a.id, status: "cancelada" })}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Enviar Laudo (PDF)</h3>
      <div>
        <select
          value={fileForm.patientId}
          onChange={e => setFileForm({ ...fileForm, patientId: Number(e.target.value) })}
        >
          <option value={0}>Selecione um paciente</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          type="file"
          accept="application/pdf"
          onChange={e => setFileForm({ ...fileForm, pdf: e.target.files?.[0] })}
        />
        <button className="btn success" onClick={sendFile}>Enviar Laudo</button>
      </div>
      <h3>Meus Laudos Enviados</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Arquivo</th>
            <th>Paciente</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f, index) => (
            <tr key={f.id}>
              <td>{f.filename}</td>
              <td>{f.patient?.name}</td>
              <td>{new Date(f.createdAt).toLocaleDateString()}</td>
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
  )};