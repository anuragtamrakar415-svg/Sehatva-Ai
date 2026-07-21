"use client";

import Link from "next/link";
import { PersonStanding } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

export function RoadmapTeaserCard() {
  const { recoverySummary, roadmapPhases } = useAppStore();
  const currentStep = roadmapPhases.find((p) => p.status === "in-progress") ?? roadmapPhases[0];

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Recovery Roadmap</p>
          <p className="mt-1 text-xs font-medium text-ink-500">
            {recoverySummary ? `Day ${recoverySummary.currentDay} of ${recoverySummary.totalDays}` : "No active plan"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-accent-blueSoft p-4">
          <div>
            <p className="text-xs font-semibold text-ink-500">Current Step</p>
            <p className="mt-1 text-[15px] font-bold text-ink-900">{currentStep?.title ?? "Nothing scheduled"}</p>
            <p className="mt-1 text-xs text-ink-500">{currentStep?.description ?? "Generate a recovery plan to get started."}</p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white">
            <PersonStanding className="h-7 w-7 text-brand-500" />
          </div>
        </div>

        <Link href="/recovery">
          <Button size="sm" className="w-full">
            Continue Roadmap
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
}
