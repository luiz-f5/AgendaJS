import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <div className="page">
      <h2>Sistema de agendamentos hospitalar</h2>
      <div>
        <a className="btn success" href="/login">Login</a>
        <a className="btn success" href="/register">Registrar</a>
      </div>
    </div>
  );
}
