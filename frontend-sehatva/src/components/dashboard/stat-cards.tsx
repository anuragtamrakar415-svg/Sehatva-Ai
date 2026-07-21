"use client";

import { Pill, Clock, AlertTriangle, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function StatCards() {
  const { dashboardStats } = useAppStore();

  const stats = [
    {
      icon: Pill,
      iconBg: "bg-accent-greenSoft",
      iconColor: "text-accent-green",
      label: "Today's Medicines",
      value: String(dashboardStats?.todaysMedicinesCount ?? 0),
      sub: "To be taken",
      link: "View Schedule",
    },
    {
      icon: Clock,
      iconBg: "bg-accent-orangeSoft",
      iconColor: "text-accent-orange",
      label: "Next Medicine",
      value: dashboardStats?.upcomingMedicineTime ?? "-",
      sub: dashboardStats?.upcomingMedicineName ?? "None scheduled",
      link: "View Details",
    },
    {
      icon: AlertTriangle,
      iconBg: "bg-accent-redSoft",
      iconColor: "text-accent-red",
      label: "Missed Medicines",
      value: String(dashboardStats?.missedMedicinesCount ?? 0),
      sub: (dashboardStats?.missedMedicinesCount ?? 0) === 0 ? "Great! no missed" : "Needs attention",
      link: "View History",
    },
    {
      icon: CalendarClock,
      iconBg: "bg-accent-purpleSoft",
      iconColor: "text-accent-purple",
      label: "Next Follow-up",
      value: dashboardStats?.nextFollowUpDays != null ? String(dashboardStats.nextFollowUpDays) : "-",
      sub: "Days Left",
      link: "View Appointment",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="p-4">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", s.iconBg)}>
            <s.icon className={cn("h-[18px] w-[18px]", s.iconColor)} />
          </div>
          <p className="mt-3 text-xs font-medium text-ink-500">{s.label}</p>
          <p className="mt-1 text-xl font-bold text-ink-900">{s.value}</p>
          <p className="text-xs text-ink-500">{s.sub}</p>
          <button className="focus-ring mt-3 text-xs font-semibold text-brand-600 hover:underline">
            {s.link}
          </button>
        </Card>
      ))}
    </div>
  );
}
