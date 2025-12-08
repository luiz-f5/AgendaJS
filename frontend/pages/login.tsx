import { useState, useEffect } from "react";
import { apiRequest, API_URL } from "../lib/api";
import { User } from "../types";
import { useToast } from "../contexts/ToastContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
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
      const res = await apiRequest<{ 
        token: string, 
        user: User 
      }>("/auth/login", "POST", form);

      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", String(res.user.id));
      localStorage.setItem("role", res.user.role ?? "");
      localStorage.setItem("userName", res.user.name);

      showToast("Login realizado com sucesso!", "success");
      window.location.href = "/dashboard";
    } catch (err: any) {
      showToast(err.message, "danger");
    }
  }

  return (
    <div className="page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" className="btn success">Login</button>
      </form>

      <div style={{ marginTop: 20 }}>
        <a className="google-btn" href={`${API_URL}/auth/google`}>
          Login com Google
        </a>
      </div>
    </div>
  );
}
