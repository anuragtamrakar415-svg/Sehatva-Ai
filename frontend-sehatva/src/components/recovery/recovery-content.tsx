"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { OverallProgressCard } from "@/components/recovery/overall-progress-card";
import { RoadmapTimeline } from "@/components/recovery/roadmap-timeline";
import { MilestoneBadges } from "@/components/recovery/milestone-badges";
import { TodaysTasksCard } from "@/components/recovery/todays-tasks-card";
import { AiMotivationCard } from "@/components/recovery/ai-motivation-card";
import { useAppStore } from "@/store/app-store";
import { recoveryService } from "@/services/recovery.service";
import { useTranslation } from "@/lib/i18n";

export function RecoveryContent() {
  const { roadmapPhases, badges, recoverySummary, refresh } = useAppStore();
  const { t } = useTranslation();
  const [diagnosis, setDiagnosis] = useState("");
  const [surgery, setSurgery] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generatePlan() {
    setGenerating(true);
    setError(null);
    try {
      await recoveryService.generatePlan({
        diagnosis: diagnosis.trim() || undefined,
        surgery: surgery.trim() || undefined,
        total_days: 30,
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate recovery plan");
    } finally {
      setGenerating(false);
    }
  }

  function downloadPlan() {
    if (!recoverySummary) return;
    const lines = [
      "Sehatva AI — Recovery Roadmap",
      `Day ${recoverySummary.currentDay} of ${recoverySummary.totalDays} (${recoverySummary.percent}% complete, score ${recoverySummary.score})`,
      "",
      ...roadmapPhases.map((p) => `[${p.status}] ${p.dayRange} — ${p.title}: ${p.description}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sehatva-recovery-plan.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{t("pages.recoveryTitle")}</h1>
          <p className="mt-1 text-sm text-ink-500">{t("pages.recoverySubtitle")}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={downloadPlan} disabled={!recoverySummary}>
          <Download className="h-4 w-4" /> Download Plan
        </Button>
      </div>

      {recoverySummary ? (
        <OverallProgressCard
          percent={recoverySummary.percent}
          day={recoverySummary.currentDay}
          total={recoverySummary.totalDays}
        />
      ) : (
        <Card>
          <CardBody className="flex flex-col gap-3">
            <p className="text-sm text-ink-500">
              No active recovery plan yet. Tell us your diagnosis or surgery and we&apos;ll generate a personalized
              30-day roadmap.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink-700">Diagnosis (optional)</label>
                <input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                  placeholder="e.g. Appendicitis"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink-700">Surgery (optional)</label>
                <input
                  value={surgery}
                  onChange={(e) => setSurgery(e.target.value)}
                  className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                  placeholder="e.g. Appendectomy"
                />
              </div>
            </div>
            {error && <p className="text-xs font-semibold text-accent-red">{error}</p>}
            <div>
              <Button size="sm" onClick={generatePlan} disabled={generating}>
                {generating ? "Generating..." : "Generate my recovery roadmap"}
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2" id="roadmap-timeline">
          <RoadmapTimeline phases={roadmapPhases} />
        </div>

        <div className="flex flex-col gap-4">
          <MilestoneBadges badges={badges} />
          <TodaysTasksCard />
          <AiMotivationCard />
        </div>
      </div>
    </div>
  );
}
