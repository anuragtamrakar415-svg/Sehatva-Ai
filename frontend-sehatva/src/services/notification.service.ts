import { apiRequest } from "./api";

export interface BackendNotification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  scheduleReminder: (medicineId: string, time: string) => {
    // Placeholder for push/local notification scheduling
    console.log(`Reminder scheduled for medicine ${medicineId} at ${time}`);
  },
  list: () => apiRequest<BackendNotification[]>("/notifications"),
  markRead: (id: string) => apiRequest<BackendNotification>(`/notifications/${id}/read`, { method: "POST" }),
  markAllRead: () => apiRequest<{ success: boolean }>("/notifications/read-all", { method: "POST" }),
};
