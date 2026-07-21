import { apiRequest } from "./api";
import type { DashboardStats } from "@/types";

interface BackendDashboard {
  ai_health_score: number;
  recovery_progress_pct: number;
  todays_medicines_count: number;
  upcoming_medicine?: { name: string; timing: string } | null;
  missed_medicines_count: number;
  next_follow_up_days?: number | null;
  caregiver_count: number;
  recent_ai_insight?: string | null;
}

export const dashboardService = {
  async get(): Promise<DashboardStats> {
    const d = await apiRequest<BackendDashboard>("/dashboard");
    return {
      aiHealthScore: d.ai_health_score,
      recoveryProgressPct: d.recovery_progress_pct,
      todaysMedicinesCount: d.todays_medicines_count,
      upcomingMedicineName: d.upcoming_medicine?.name ?? null,
      upcomingMedicineTime: d.upcoming_medicine?.timing ?? null,
      missedMedicinesCount: d.missed_medicines_count,
      nextFollowUpDays: d.next_follow_up_days ?? null,
      caregiverCount: d.caregiver_count,
      recentAiInsight: d.recent_ai_insight ?? null,
    };
  },
};
