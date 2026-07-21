import { apiRequest } from "./api";

interface SosLogOut {
  id: string;
  latitude?: number | null;
  longitude?: number | null;
  caregiver_notified: boolean;
  status: string;
  created_at: string;
}

export const sosService = {
  trigger: (payload?: { latitude?: number; longitude?: number; notes?: string }) =>
    apiRequest<SosLogOut>("/sos/trigger", { method: "POST", body: JSON.stringify(payload ?? {}) }),
  history: () => apiRequest<SosLogOut[]>("/sos/history"),
};
