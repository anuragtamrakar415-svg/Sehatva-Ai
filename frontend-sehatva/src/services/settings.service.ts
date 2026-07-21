import { apiRequest } from "./api";

export interface BackendSettings {
  language: string;
  dark_mode: boolean;
}

export const settingsService = {
  get: () => apiRequest<BackendSettings>("/settings"),
  update: (payload: Partial<BackendSettings>) =>
    apiRequest<BackendSettings>("/settings", { method: "PUT", body: JSON.stringify(payload) }),
};
