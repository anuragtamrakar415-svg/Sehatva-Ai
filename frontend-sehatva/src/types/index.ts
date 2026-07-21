export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Medicine {
  id: string;
  /** Underlying medicine record id (id above is the *today's log* id used for toggling). */
  medicineId: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  stock: number;
}

export interface RoadmapPhase {
  id: string;
  dayRange: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "upcoming";
  icon: "rest" | "walk" | "activity" | "checkup" | "normal";
}

export interface Badge {
  id: string;
  label: string;
  earned: boolean;
}

export interface RecoverySummary {
  percent: number;
  currentDay: number;
  totalDays: number;
  score: number;
}

export interface Task {
  id: string;
  label: string;
  done: boolean;
}

export interface Caregiver {
  id: string;
  name: string;
  relation: string;
  phone: string;
  avatarUrl?: string;
}

export interface DashboardStats {
  aiHealthScore: number;
  recoveryProgressPct: number;
  todaysMedicinesCount: number;
  upcomingMedicineName: string | null;
  upcomingMedicineTime: string | null;
  missedMedicinesCount: number;
  nextFollowUpDays: number | null;
  caregiverCount: number;
  recentAiInsight: string | null;
}

export interface ActivityItem {
  id: string;
  label: string;
  time: string;
  status: "Taken" | "Completed" | "Alert";
}

export interface HealthReport {
  id: string;
  title: string;
  rawText: string;
  summary?: string;
  keyFindings?: string[];
  recommendations?: string[];
  createdAt: string;
}

export interface InsuranceClaim {
  id: string;
  provider: string;
  status: "pending" | "approved" | "rejected";
  amount: number;
  submittedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export type NavKey =
  | "dashboard"
  | "recovery"
  | "medicines"
  | "scan"
  | "reports"
  | "ai-chat"
  | "insurance"
  | "caregiver"
  | "sos"
  | "profile"
  | "settings";
