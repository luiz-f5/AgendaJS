import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { User } from "../types";
import ConfirmDialog from "../components/confirmDialog";

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/"; 
      return;
    }

    apiRequest<User>("/users/me", "GET", undefined, token).then(u => {
      setUser(u);
      setRole(u.role);
    });
  }, [token]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    setRole(null);
    setUser(null);
    window.location.href = "/";
  }

  return (
    <div className="page">
      <h2>Dashboard</h2>

      {role && role !== "null" && (
        <p>
          Bem-vind@, <strong>{user?.name ?? role}</strong>!
        </p>
      )}

      {role === null && user && (
        <p>Espere até o Admin lhe conceder um role.</p>
      )}

      {role === "admin" && (
        <ul>
          <li><Link className="btn success" href="/admin/users">Usuários</Link></li>
          <li><Link className="btn success" href="/admin/notifications">Notificações</Link></li>
          <li><Link className="btn success" href="/admin/specialties">Especialidades</Link></li>
        </ul>
      )}

      {role === "medico" && (
        <ul>
          <li><Link className="btn success" href="/doctor/appointments">Consultas</Link></li>
          <li><Link className="btn success" href="/doctor/notifications">Notificações</Link></li>
          <li><Link className="btn success" href="/doctor/files">Laudos</Link></li>
          <li><Link className="btn success" href="/doctor/settings">Configurações</Link></li>
        </ul>
      )}

      {role === "paciente" && (
        <ul>
          <li><Link className="btn success" href="/patient/appointments">Consultas</Link></li>
          <li><Link className="btn success" href="/patient/notifications">Notificações</Link></li>
          <li><Link className="btn success" href="/patient/files">Laudos</Link></li>
        </ul>
      )}

      {!role && !user && <p>Faça login para acessar seu painel.</p>}

      {user && (
        <div style={{ marginTop: 20 }}>
          <button className="btn danger" onClick={() => setConfirmLogout(true)}>Logout</button>
        </div>
      )}

      {confirmLogout && (
        <ConfirmDialog
          title="Confirmar Logout"
          message="Tem certeza que deseja sair da sua conta?"
          onConfirm={() => {
            logout();
            setConfirmLogout(false);
          }}
          onCancel={() => setConfirmLogout(false)}
        />
      )}
    </div>
  );
}
