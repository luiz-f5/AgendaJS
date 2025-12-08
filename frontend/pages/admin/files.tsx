import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { MedicalFile } from "../../types";
import { useToast } from "../../contexts/ToastContext";

export default function AdminFilesPage() {
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) return;
    apiRequest<MedicalFile[]>("/files/all", "GET", undefined, token).then(setFiles).catch(() => {
      showToast("Erro ao carregar arquivos", "danger");
    });
  }, [token]);

  async function removeFile(id: number) {
    try {
      await apiRequest(`/files/remove/${id}`, "DELETE", undefined, token!);
      setFiles(files.filter(f => f.id !== id));
      showToast("Arquivo removido com sucesso!", "success");
    } catch {
      showToast("Erro ao remover arquivo!", "danger");
    }
  }

  return (
    <div className="page">
      <h2>Arquivos Enviados (Admin)</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Arquivo</th>
            <th>Médico</th>
            <th>Paciente</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {files.map(f => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.filename}</td>
              <td>{f.doctor?.name}</td>
              <td>{f.patient?.name}</td>
              <td>{new Date(f.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="btn danger" onClick={() => removeFile(f.id)}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
