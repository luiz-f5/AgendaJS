import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { Schedule, Specialty, User } from "../../types";
import { useToast } from "../../contexts/ToastContext";

export default function DoctorSettingsPage() {
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const doctorId = typeof window !== "undefined" ? Number(localStorage.getItem("userId")) : null;
  const { showToast } = useToast();

  const allowedHours = [
    "09:00","10:00","11:00","12:00","13:00",
    "14:00","15:00","16:00","17:00"
  ];

  useEffect(() => {
    if (!token || !doctorId) return;

    apiRequest<Schedule[]>(`/schedules/${doctorId}`, "GET", undefined, token).then(data => {
      setSelectedHours(data.map(s => s.hour));
    });

    apiRequest<Specialty[]>("/specialties", "GET", undefined, token).then(setSpecialties);
    apiRequest<User>("/users/me", "GET", undefined, token).then(doctor => {
      if (doctor.specialtyId) setSpecialtyId(doctor.specialtyId);
    });
  }, [token, doctorId]);

  function toggleHour(hour: string) {
    if (selectedHours.includes(hour)) {
      setSelectedHours(selectedHours.filter(h => h !== hour));
    } else {
      setSelectedHours([...selectedHours, hour]);
    }
  }

  async function saveSettings() {
    try {
      await apiRequest("/schedules/bulk", "POST", { selectedHours }, token!);
      if (specialtyId) {
        await apiRequest("/users/me/specialty", "PATCH", { specialtyId }, token!);
      }
      showToast("Configurações atualizadas com sucesso!", "success");
    } catch {
      showToast("Erro ao salvar configurações!", "danger");
    }
  }

  return (
    <div className="page">
      <h2>Configurações do Médico</h2>
      <h3>Minha Especialidade</h3>
      <div>
        <select
          value={specialtyId ?? ""}
          onChange={e => setSpecialtyId(Number(e.target.value))}
        >
          <option value="">Selecione uma especialidade</option>
          {specialties.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <h3>Definir Horários Globais</h3>
      <div>
        {allowedHours.map(hour => (
          <label key={hour} style={{ marginRight: 15 }}>
            <input
              type="checkbox"
              checked={selectedHours.includes(hour)}
              onChange={() => toggleHour(hour)}
            />
            {hour}
          </label>
        ))}
      </div>
      <button className="btn success" onClick={saveSettings}>Salvar Configurações</button>
    </div>
  );
}
