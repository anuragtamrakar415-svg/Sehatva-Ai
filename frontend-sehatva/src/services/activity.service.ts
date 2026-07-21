import { apiRequest } from "./api";
import type { ActivityItem } from "@/types";

interface BackendActivityLog {
  id: string;
  action: string;
  details?: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; status: ActivityItem["status"] }> = {
  medicine_taken: { label: "Medicine taken", status: "Taken" },
  sos_triggered: { label: "Emergency SOS triggered", status: "Alert" },
  report_analyzed: { label: "Discharge summary analyzed", status: "Completed" },
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export const activityService = {
  async recent(limit = 5): Promise<ActivityItem[]> {
    const logs = await apiRequest<BackendActivityLog[]>(`/activity?limit=${limit}`);
    return logs.map((log) => {
      const meta = ACTION_LABELS[log.action] ?? { label: log.action.replace(/_/g, " "), status: "Completed" as const };
      return { id: log.id, label: meta.label, time: relativeTime(log.created_at), status: meta.status };
    });
  },
};
