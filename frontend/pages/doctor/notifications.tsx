import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { Notification, User } from "../../types";
import { useToast } from "../../contexts/ToastContext";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sentNotifications, setSentNotifications] = useState<Notification[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [notifForm, setNotifForm] = useState({ subject: "", message: "", patientId: 0 });
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) return;
    apiRequest<Notification[]>("/notifications/doctor/my", "GET", undefined, token).then(setNotifications);
    apiRequest<Notification[]>("/notifications/doctor/sent", "GET", undefined, token).then(setSentNotifications);
    apiRequest<User[]>("/users/patients", "GET", undefined, token).then(setPatients);
  }, [token]);

  async function sendNotification() {
    try {
      if (!notifForm.subject || !notifForm.message || !notifForm.patientId) {
        showToast("Preencha todos os campos!", "danger");
        return;
      }
      await apiRequest("/notifications/doctor/send", "POST", notifForm, token!);
      showToast("Notificação enviada com sucesso!", "success");
      setNotifForm({ subject: "", message: "", patientId: 0 });
      const updatedSent = await apiRequest<Notification[]>("/notifications/doctor/sent", "GET", undefined, token!);
      setSentNotifications(updatedSent);
    } catch {
      showToast("Erro ao enviar notificação!", "danger");
    }
  }

  return (
    <div className="page">
      <h2>Minhas Notificações</h2>
      <h3>Recebidas</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Assunto</th>
            <th>Mensagem</th>
            <th>De</th>
            <th>Escopo</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map(n => (
            <tr key={n.id}>
              <td>{n.subject}</td>
              <td>{n.message}</td>
              <td>{n.senderName}</td>
              <td>{n.scope}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Enviadas</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Assunto</th>
            <th>Mensagem</th>
            <th>Paciente</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {sentNotifications.map(n => (
            <tr key={n.id}>
              <td>{n.subject}</td>
              <td>{n.message}</td>
              <td>{n.targetUser?.name ?? "-"}</td>
              <td>{new Date(n.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Enviar Notificação para Paciente</h3>
      <div>
        <select
          value={notifForm.patientId}
          onChange={e => setNotifForm({ ...notifForm, patientId: Number(e.target.value) })}
        >
          <option value={0}>Selecione um paciente</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          placeholder="Assunto"
          value={notifForm.subject}
          onChange={e => setNotifForm({ ...notifForm, subject: e.target.value })}
        />
        <textarea
          placeholder="Mensagem"
          value={notifForm.message}
          onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
        />
        <button className="btn success" onClick={sendNotification}>Enviar</button>
      </div>
    </div>
  );
}
