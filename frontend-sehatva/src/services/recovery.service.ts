import { apiRequest, ApiError } from "./api";
import type { Badge, RecoverySummary, RoadmapPhase } from "@/types";

interface BackendTask {
  id: string;
  day_start: number;
  day_end: number;
  stage_label: string;
  category: string;
  title: string;
  description?: string | null;
  status: string; // "completed" | "in_progress" | "pending"
}

interface BackendPlan {
  id: string;
  start_date: string;
  total_days: number;
  status: string;
  recovery_score: number;
  recovery_xp: number;
  recovery_level: number;
  daily_streak: number;
  tasks: BackendTask[];
}

interface BackendBadge {
  id: string;
  badge_key: string;
  earned_at: string;
}

const ICONS: Record<string, RoadmapPhase["icon"]> = {
  rest: "rest",
  walk: "walk",
  walking: "walk",
  activity: "activity",
  checkup: "checkup",
  appointment: "checkup",
  normal: "normal",
};

function mapStatus(status: string): RoadmapPhase["status"] {
  if (status === "completed") return "completed";
  if (status === "in_progress") return "in-progress";
  return "upcoming";
}

function mapPhases(tasks: BackendTask[]): RoadmapPhase[] {
  return tasks
    .slice()
    .sort((a, b) => a.day_start - b.day_start)
    .map((t) => ({
      id: t.id,
      dayRange: `Day ${t.day_start} - ${t.day_end}`,
      title: t.title,
      description: t.description ?? t.stage_label,
      status: mapStatus(t.status),
      icon: ICONS[t.category?.toLowerCase()] ?? "normal",
    }));
}

function currentDay(plan: BackendPlan): number {
  const start = new Date(plan.start_date).getTime();
  const diffDays = Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(diffDays, 1), plan.total_days);
}

async function getActivePlan(): Promise<{ phases: RoadmapPhase[]; summary: RecoverySummary } | null> {
  try {
    const plan = await apiRequest<BackendPlan>("/recovery/active");
    const total = plan.tasks.length || 1;
    const completed = plan.tasks.filter((t) => t.status === "completed").length;
    return {
      phases: mapPhases(plan.tasks),
      summary: {
        percent: Math.round((100 * completed) / total),
        currentDay: currentDay(plan),
        totalDays: plan.total_days,
        score: plan.recovery_score,
      },
    };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

function humanizeBadgeKey(key: string): string {
  return key
    .split(/[_-]/g)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function getBadges(): Promise<Badge[]> {
  const badges = await apiRequest<BackendBadge[]>("/recovery/badges");
  return badges.map((b) => ({ id: b.id, label: humanizeBadgeKey(b.badge_key), earned: true }));
}

async function generatePlan(payload: {
  diagnosis?: string;
  surgery?: string;
  total_days?: number;
}): Promise<void> {
  await apiRequest<BackendPlan>("/recovery/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export const recoveryService = {
  getActivePlan,
  getBadges,
  generatePlan,
  updateTaskStatus: (taskId: string, status: string) =>
    apiRequest(`/recovery/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
