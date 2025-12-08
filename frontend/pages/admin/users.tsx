import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { User } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import ConfirmDialog from "../../components/confirmDialog";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<Partial<User> & { password?: string }>({});
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [confirmDialog, setConfirmDialog] = useState<{ id: number; role?: string } | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const currentUserId = typeof window !== "undefined" ? Number(localStorage.getItem("userId")) : null;
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) return;
    apiRequest<User[]>("/users", "GET", undefined, token).then(setUsers);
  }, [token]);

  async function createOrUpdateUser() {
    try {
      if (form.role === "admin") {
        showToast("Admins não podem criar ou editar outros admins!", "danger");
        return;
      }
      if (form.id) {
        if (form.id === currentUserId) {
          showToast("Admin não pode editar a si mesmo!", "danger");
          return;
        }
        const updated = await apiRequest<User>(`/users/${form.id}`, "PUT", form, token!);
        setUsers(users.map(u => (u.id === updated.id ? updated : u)));
        showToast("Usuário atualizado com sucesso!", "success");
      } else {
        const created = await apiRequest<User>("/users", "POST", form, token!);
        setUsers([...users, created]);
        showToast("Usuário criado com sucesso!", "success");
      }
      setForm({});
    } catch {
      showToast("Erro ao salvar usuário!", "danger");
    }
  }

  async function removeUser(id: number, role?: string) {
    try {
      if (role === "admin" || id === currentUserId) {
        showToast("Admins não podem remover outros admins nem a si mesmos!", "danger");
        return;
      }
      await apiRequest(`/users/${id}`, "DELETE", undefined, token!);
      setUsers(users.filter(u => u.id !== id));
      showToast("Usuário removido com sucesso!", "success");
    } catch {
      showToast("Erro ao remover usuário!", "danger");
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    let matchesRole = true;
    if (filterRole) {
      if (filterRole === "null") {
        matchesRole = !u.role;
      } else {
        matchesRole = u.role === filterRole;
      }
    }

    return matchesSearch && matchesRole;
  });

  return (
    <div className="page">
      <h2>Gerenciar Usuários</h2>
      <h3>{form.id ? "Editar Usuário" : "Criar Usuário"}</h3>
      <div>
        <input
          placeholder="Nome"
          value={form.name || ""}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email || ""}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Senha"
          value={form.password || ""}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <select
          value={form.role ?? ""}
          onChange={e => setForm({ ...form, role: e.target.value || null })}
        >
          <option value="">Sem role</option>
          <option value="paciente">Paciente</option>
          <option value="medico">Médico</option>
        </select>
        <button className="btn success" onClick={createOrUpdateUser}>
          {form.id ? "Salvar" : "Criar"}
        </button>
      </div>
      <div>
        <input
          placeholder="Pesquisar nome ou email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="paciente">Paciente</option>
          <option value="medico">Médico</option>
          <option value="admin">Admin</option>
          <option value="null">Sem role</option>
        </select>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role ?? "Sem role"}</td>
              <td>
                {u.role !== "admin" && u.id !== currentUserId && (
                  <>
                    <button className="btn success" onClick={() => setForm({ ...u })}>Editar</button>
                    <button
                      className="btn danger"
                      onClick={() => setConfirmDialog({ id: u.id, role: u.role })}
                    >
                      Remover
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
          title="Confirmar Remoção"
          message="Tem certeza que deseja remover este usuário?"
          onConfirm={() => {
            removeUser(confirmDialog.id, confirmDialog.role);
            setConfirmDialog(null);
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
