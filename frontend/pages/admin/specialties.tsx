import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { Specialty } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import ConfirmDialog from "../../components/confirmDialog";

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtyForm, setSpecialtyForm] = useState<Partial<Specialty>>({});
  const [confirmDialog, setConfirmDialog] = useState<{ id: number } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) return;
    apiRequest<Specialty[]>("/specialties", "GET", undefined, token).then(setSpecialties);
  }, [token]);

  async function createSpecialty() {
    try {
      if (!specialtyForm.name) {
        showToast("Nome da especialidade é obrigatório!", "danger");
        return;
      }
      const created = await apiRequest<Specialty>("/specialties", "POST", specialtyForm, token!);
      setSpecialties([...specialties, created]);
      setSpecialtyForm({});
      showToast("Especialidade criada com sucesso!", "success");
    } catch {
      showToast("Erro ao criar especialidade!", "danger");
    }
  }

  async function removeSpecialty(id: number) {
    try {
      await apiRequest(`/specialties/${id}`, "DELETE", undefined, token!);
      setSpecialties(specialties.filter(s => s.id !== id));
      showToast("Especialidade removida com sucesso!", "success");
    } catch {
      showToast("Erro ao remover especialidade!", "danger");
    }
  }

  return (
    <div className="page">
      <h2>Gerenciar Especialidades</h2>
      <h3>Criar Especialidade</h3>
      <div>
        <input
          placeholder="Nome"
          value={specialtyForm.name || ""}
          onChange={e => setSpecialtyForm({ ...specialtyForm, name: e.target.value })}
        />
        <button className="btn success" onClick={createSpecialty}>
          Criar Especialidade
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {specialties.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>
                <button
                  className="btn danger"
                  onClick={() => setConfirmDialog({ id: s.id })}
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {confirmDialog && (
        <ConfirmDialog
          title="Confirmar Remoção"
          message="Tem certeza que deseja remover esta especialidade?"
          onConfirm={() => {
            removeSpecialty(confirmDialog.id);
            setConfirmDialog(null);
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
