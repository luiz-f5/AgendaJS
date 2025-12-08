import { useEffect, useState } from "react";
import { apiRequest, API_URL } from "../../lib/api";
import { MedicalFile, User } from "../../types";
import { useToast } from "../../contexts/ToastContext";

export default function DoctorReportsPage() {
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [fileForm, setFileForm] = useState<{ patientId: number; pdf?: File }>({ patientId: 0 });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const doctorId = typeof window !== "undefined" ? Number(localStorage.getItem("userId")) : null;
  const { showToast } = useToast();

  useEffect(() => {
    if (!token || !doctorId) return;
    apiRequest<User[]>("/users/patients", "GET", undefined, token).then(setPatients);
    apiRequest<MedicalFile[]>(`/files/sent/${doctorId}`, "GET", undefined, token).then(setFiles);
  }, [token, doctorId]);

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
      <h2>Meus Laudos</h2>
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
      <h3>Laudos Enviados</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Arquivo</th>
            <th>Paciente</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {files.map(f => (
            <tr key={f.id}>
              <td>{f.filename}</td>
              <td>{f.patient?.name}</td>
              <td>{new Date(f.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
