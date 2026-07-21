"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";

export function AiSummaryCard() {
  const { dashboardStats } = useAppStore();

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-ink-900">AI Health Summary</p>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-purpleSoft text-accent-purple">
            <Sparkles className="h-4 w-4" />
          </span>
        </div>
        <p className="text-sm text-ink-700">
          {dashboardStats?.recentAiInsight ?? "No AI insight yet - upload a report to get a personalized summary."}
        </p>
        <Link href="/reports" className="focus-ring self-start text-xs font-semibold text-brand-600 hover:underline">
          View Full Summary
        </Link>
      </CardBody>
    </Card>
  );
}
