"use client";

import Link from "next/link";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export function RecoveryProgressCard() {
  const { recoverySummary, dashboardStats } = useAppStore();
  const percent = recoverySummary?.percent ?? dashboardStats?.recoveryProgressPct ?? 0;
  const score = recoverySummary?.score ?? 0;

  return (
    <div className="flex flex-col justify-between gap-6 rounded-2xl bg-gradient-to-br from-brand-800 to-brand-900 p-6 text-white sm:flex-row sm:items-center">
      <div className="flex items-center gap-5">
        <ProgressRing percent={percent} />
        <div>
          <p className="text-sm font-semibold text-white/70">Your Recovery Progress</p>
          <p className="mt-1 max-w-xs text-[15px] leading-snug text-white/90">
            {percent >= 100
              ? "Amazing! You've completed your recovery plan."
              : "Great job! You\u2019re on the right track. Keep following your recovery plan."}
          </p>
          <Link href="/recovery">
            <Button variant="secondary" className="mt-3 !bg-white !text-brand-700 hover:!bg-white/90" size="sm">
              View Roadmap
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4">
        <div>
          <p className="text-xs font-medium text-white/70">Recovery Score</p>
          <p className="mt-1 text-2xl font-bold">{score}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-accent-green">
            <ShieldCheck className="h-3.5 w-3.5" /> {score >= 700 ? "Excellent" : score >= 400 ? "Good" : "Keep going"}
          </p>
        </div>
      </div>
    </div>
  );
}
