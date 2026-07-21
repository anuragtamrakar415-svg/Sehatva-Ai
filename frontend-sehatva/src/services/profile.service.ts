import { apiRequest } from "./api";

export interface EmergencyContact {
  id: string;
  name: string;
  relation?: string | null;
  phone: string;
}

export interface ProfileData {
  user: { id: string; name: string; email: string; phone?: string | null };
  profile: {
    age?: number | null;
    weight_kg?: number | null;
    height_cm?: number | null;
    blood_group?: string | null;
    date_of_birth?: string | null;
    allergies?: string | null;
    medical_history?: string | null;
    avatar_url?: string | null;
    emergency_contacts: EmergencyContact[];
  };
}

export const profileService = {
  get: () => apiRequest<ProfileData>("/profile"),
  update: (payload: Partial<{ name: string; age: number; weight_kg: number; height_cm: number; blood_group: string }>) =>
    apiRequest<ProfileData>("/profile", { method: "PUT", body: JSON.stringify(payload) }),
};
