import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api";
import { useToast } from "../contexts/ToastContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiRequest("/auth/register", "POST", form);
      showToast("Registrado com sucesso!", "success");
      window.location.href = "/login";
    } catch (err: any) {
      showToast(err.message, "danger");
    }
  }

  return (
    <div className="page">
      <h2>Registrar</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Nome"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit" className="btn success">Registrar</button>
      </form>
    </div>
  );
}
