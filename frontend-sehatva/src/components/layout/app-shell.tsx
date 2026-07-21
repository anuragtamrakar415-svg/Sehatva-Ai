"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useAppStore } from "@/store/app-store";
import { SosDialog } from "@/components/caregiver/sos-dialog";

export function AppShell({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  const { isAuthenticated, loading } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm font-medium text-ink-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar actions={actions} />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
      <SosDialog />
    </div>
  );
}
