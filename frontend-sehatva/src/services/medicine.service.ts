import { apiRequest } from "./api";
import type { Medicine } from "@/types";

interface BackendMedicine {
  id: string;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  timing: string;
  food_relation: string;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
}

interface BackendMedicineLog {
  id: string;
  medicine_id: string;
  scheduled_time: string;
  taken_time?: string | null;
  status: "taken" | "missed" | "pending";
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

async function todaysMedicines(): Promise<Medicine[]> {
  const [medicines, logs] = await Promise.all([
    apiRequest<BackendMedicine[]>("/medicines"),
    apiRequest<BackendMedicineLog[]>("/medicines/logs/today"),
  ]);

  const byId = new Map(medicines.map((m) => [m.id, m]));

  return logs
    .map((log) => {
      const med = byId.get(log.medicine_id);
      if (!med) return null;
      const m: Medicine = {
        id: log.id,
        medicineId: med.id,
        name: med.name,
        dosage: med.dosage ?? med.frequency ?? "",
        time: formatTime(log.scheduled_time),
        taken: log.status === "taken",
        stock: med.stock,
      };
      return m;
    })
    .filter((m): m is Medicine => m !== null);
}

export const medicineService = {
  todaysMedicines,

  /** Toggle a today's-log entry between taken/pending. `id` is the log id (Medicine.id above). */
  setLogStatus: (logId: string, status: "taken" | "pending") =>
    apiRequest<BackendMedicineLog>(`/medicines/logs/${logId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  create: (payload: {
    name: string;
    dosage?: string;
    timing?: string;
    food_relation?: string;
    stock?: number;
  }) => apiRequest<BackendMedicine>("/medicines", { method: "POST", body: JSON.stringify(payload) }),

  explain: (medicineId: string) =>
    apiRequest<{ explanation: string }>(`/medicines/${medicineId}/explain`, { method: "POST" }),
};
