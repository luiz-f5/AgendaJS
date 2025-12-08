import { useEffect, useState } from "react";
import { apiRequest, downloadFile } from "../../lib/api";
import { MedicalFile } from "../../types";

export default function PatientFilesPage() {
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;
    apiRequest<MedicalFile[]>("/files/my-files", "GET", undefined, token).then(setFiles);
  }, [token]);

  return (
    <div className="page">
      <h2>Meus Laudos</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Arquivo</th>
            <th>Médico</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {files.map(f => (
            <tr key={f.id}>
              <td>{f.filename}</td>
              <td>{f.doctor?.name}</td>
              <td>{new Date(f.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn success"
                  onClick={() => downloadFile(`/files/download/${f.id}`, f.filename, token!)}
                >
                  Baixar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
