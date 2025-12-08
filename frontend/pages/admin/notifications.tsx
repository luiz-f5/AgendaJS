import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import { User, Notification } from "../../types";
import { useToast } from "../../contexts/ToastContext";

export default function NotificationsPage() {
  const [notif, setNotif] = useState({ subject: "", message: "", scope: "todos", targetUserId: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) return;
    apiRequest<User[]>("/users", "GET", undefined, token).then(setUsers);
    apiRequest<Notification[]>("/notifications/admin/all", "GET", undefined, token).then(setNotifications);
  }, [token]);

  async function sendNotification() {
    try {
      if (!notif.subject || !notif.message) {
        showToast("Assunto e mensagem são obrigatórios!", "danger");
        return;
      }
      await apiRequest("/notifications/admin/send", "POST", notif, token!);
      setNotif({ subject: "", message: "", scope: "todos", targetUserId: 0 });
      showToast("Notificação enviada com sucesso!", "success");
      const updated = await apiRequest<Notification[]>("/notifications/admin/all", "GET", undefined, token!);
      setNotifications(updated);
    } catch {
      showToast("Erro ao enviar notificação!", "danger");
    }
  }

  return (
    <div className="page">
      <h2>Gerenciar Notificações</h2>
      <h3>Criar Notificação</h3>
      <div>
        <input
          placeholder="Assunto"
          value={notif.subject}
          onChange={e => setNotif({ ...notif, subject: e.target.value })}
        />
        <textarea
          placeholder="Mensagem"
          value={notif.message}
          onChange={e => setNotif({ ...notif, message: e.target.value })}
        />
        <select value={notif.scope} onChange={e => setNotif({ ...notif, scope: e.target.value })}>
          <option value="todos">Todos</option>
          <option value="medicos">Médicos</option>
          <option value="pacientes">Pacientes</option>
          <option value="user">Usuário específico</option>
        </select>

        {notif.scope === "user" && (
          <select
            value={notif.targetUserId}
            onChange={e => setNotif({ ...notif, targetUserId: Number(e.target.value) })}
          >
            <option value={0}>Selecione um usuário</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role ?? "Sem role"})
              </option>
            ))}
          </select>
        )}

        <button className="btn success" onClick={sendNotification}>Enviar</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Assunto</th>
            <th>Mensagem</th>
            <th>Escopo</th>
            <th>Usuário alvo</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map(n => (
            <tr key={n.id}>
              <td>{n.subject}</td>
              <td>{n.message}</td>
              <td>{n.scope}</td>
              <td>{n.targetUser ? `${n.targetUser.name} (${n.targetUser.role ?? "Sem role"})` : "-"}</td>
              <td>{new Date(n.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
