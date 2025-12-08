import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { Notification } from "../../types";

export default function PatientNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;
    apiRequest<Notification[]>("/notifications/patient/my", "GET", undefined, token).then(setNotifications);
  }, [token]);

  return (
    <div className="page">
      <h2>Minhas Notificações</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Assunto</th>
            <th>Mensagem</th>
            <th>De</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map(n => (
            <tr key={n.id}>
              <td>{n.subject}</td>
              <td>{n.message}</td>
              <td>{n.senderName}</td>
              <td>{new Date(n.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

