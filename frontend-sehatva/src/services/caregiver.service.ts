import { apiRequest } from "./api";
import type { Caregiver } from "@/types";

interface BackendCaregiver {
  id: string;
  name: string;
  relation?: string | null;
  phone: string;
  email?: string | null;
  status: string;
}

function mapCaregiver(c: BackendCaregiver): Caregiver {
  return { id: c.id, name: c.name, relation: c.relation ?? "Caregiver", phone: c.phone };
}

export const caregiverService = {
  async list(): Promise<Caregiver[]> {
    const list = await apiRequest<BackendCaregiver[]>("/caregivers");
    return list.map(mapCaregiver);
  },

  async add(payload: { name: string; relation?: string; phone: string; email?: string }): Promise<Caregiver> {
    const c = await apiRequest<BackendCaregiver>("/caregivers", { method: "POST", body: JSON.stringify(payload) });
    return mapCaregiver(c);
  },

  remove: (id: string) => apiRequest<{ success: boolean }>(`/caregivers/${id}`, { method: "DELETE" }),
};
