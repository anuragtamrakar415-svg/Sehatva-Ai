"use client";

import { FileText, Pill, Siren, Sparkles } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types";

const ICON_MAP: Record<ActivityItem["status"], typeof Pill> = {
  Taken: Pill,
  Completed: FileText,
  Alert: Siren,
};

const BADGE_STYLES: Record<ActivityItem["status"], string> = {
  Taken: "bg-accent-greenSoft text-accent-green",
  Completed: "bg-accent-blueSoft text-accent-blue",
  Alert: "bg-accent-redSoft text-accent-red",
};

export function RecentActivity() {
  const { recentActivity } = useAppStore();

  return (
    <Card>
      <CardBody>
        <p className="mb-3 text-[15px] font-bold text-ink-900">Recent Activity</p>
        {recentActivity.length === 0 ? (
          <p className="py-3 text-sm text-ink-500">No activity yet — it will show up here as you use the app.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-surface-border">
            {recentActivity.map((item) => {
              const Icon = ICON_MAP[item.status] ?? Sparkles;
              return (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink-900">{item.label}</p>
                      <p className="text-xs text-ink-500">{item.time}</p>
                    </div>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", BADGE_STYLES[item.status])}>
                    {item.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
