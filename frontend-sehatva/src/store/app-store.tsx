"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services/auth.service";
import { medicineService } from "@/services/medicine.service";
import { recoveryService } from "@/services/recovery.service";
import { caregiverService } from "@/services/caregiver.service";
import { dashboardService } from "@/services/dashboard.service";
import { activityService } from "@/services/activity.service";
import { settingsService } from "@/services/settings.service";
import { getAuthToken } from "@/lib/auth-token";
import type {
  ActivityItem,
  Badge,
  Caregiver,
  DashboardStats,
  Medicine,
  RecoverySummary,
  RoadmapPhase,
  Task,
  User,
} from "@/types";

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  medicines: Medicine[];
  tasks: Task[];
  caregivers: Caregiver[];
  roadmapPhases: RoadmapPhase[];
  badges: Badge[];
  recoverySummary: RecoverySummary | null;
  dashboardStats: DashboardStats | null;
  recentActivity: ActivityItem[];

  theme: "light" | "dark";
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  fontSize: "sm" | "md" | "lg";
  setFontSize: (size: "sm" | "md" | "lg") => void;

  toggleMedicine: (id: string) => void;
  toggleTask: (id: string) => void;
  refresh: () => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [roadmapPhases, setRoadmapPhases] = useState<RoadmapPhase[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [recoverySummary, setRecoverySummary] = useState<RecoverySummary | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguageState] = useState("en");
  const [fontSize, setFontSizeState] = useState<"sm" | "md" | "lg">("md");

  // Font size is a device-level accessibility preference (no backend field for it) -
  // read any saved choice on first mount, before the network settings load below.
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("sehatva_font_size") : null;
    if (saved === "sm" || saved === "md" || saved === "lg") setFontSizeState(saved);
  }, []);

  const loadAll = useCallback(async () => {
    if (!getAuthToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [me, meds, cgs, plan, badgeList, stats, activity] = await Promise.all([
        authService.me(),
        medicineService.todaysMedicines(),
        caregiverService.list(),
        recoveryService.getActivePlan(),
        recoveryService.getBadges(),
        dashboardService.get(),
        activityService.recent(5),
      ]);

      setUser(me);
      setMedicines(meds);
      setCaregivers(cgs);
      setRoadmapPhases(plan?.phases ?? []);
      setRecoverySummary(plan?.summary ?? null);
      setBadges(badgeList);
      setDashboardStats(stats);
      setRecentActivity(activity);

      // Settings failure shouldn't block the rest of the dashboard from loading.
      settingsService
        .get()
        .then((s) => {
          setTheme(s.dark_mode ? "dark" : "light");
          setLanguageState(s.language);
        })
        .catch(() => {
          // keep defaults (light / en) if this fails
        });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const tasks: Task[] = useMemo(
    () => medicines.map((m) => ({ id: m.id, label: `Take ${m.name} (${m.time})`, done: m.taken })),
    [medicines]
  );

  const toggleMedicine = useCallback((id: string) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m)));
    const target = medicines.find((m) => m.id === id);
    const nextStatus = target?.taken ? "pending" : "taken";
    medicineService.setLogStatus(id, nextStatus).catch(() => {
      // roll back optimistic update on failure
      setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m)));
    });
  }, [medicines]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      settingsService.update({ dark_mode: next === "dark" }).catch(() => {
        // non-fatal: local theme still switches even if persistence fails
      });
      return next;
    });
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    settingsService.update({ language: lang }).catch(() => {
      // non-fatal: local language still switches even if persistence fails
    });
  }, []);

  const setFontSize = useCallback((size: "sm" | "md" | "lg") => {
    setFontSizeState(size);
    if (typeof window !== "undefined") window.localStorage.setItem("sehatva_font_size", size);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setMedicines([]);
    setCaregivers([]);
    setRoadmapPhases([]);
    setBadges([]);
    setRecoverySummary(null);
    setDashboardStats(null);
    setRecentActivity([]);
    setTheme("light");
    setLanguageState("en");
    setError(null);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const scale = fontSize === "sm" ? 0.9 : fontSize === "lg" ? 1.15 : 1;
    document.documentElement.style.setProperty("--app-font-scale", String(scale));
  }, [fontSize]);

  const value = useMemo<AppState>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      error,
      medicines,
      tasks,
      caregivers,
      roadmapPhases,
      badges,
      recoverySummary,
      dashboardStats,
      recentActivity,
      theme,
      toggleTheme,
      language,
      setLanguage,
      fontSize,
      setFontSize,
      toggleMedicine,
      toggleTask: toggleMedicine, // "today's tasks" are derived from today's medicine logs
      refresh: loadAll,
      logout,
    }),
    [
      user,
      loading,
      error,
      medicines,
      tasks,
      caregivers,
      roadmapPhases,
      badges,
      recoverySummary,
      dashboardStats,
      recentActivity,
      theme,
      toggleTheme,
      language,
      setLanguage,
      fontSize,
      setFontSize,
      toggleMedicine,
      loadAll,
      logout,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
