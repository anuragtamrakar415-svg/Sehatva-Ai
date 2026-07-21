import { Bed, PersonStanding, Activity, Stethoscope, Sun } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import type { RoadmapPhase } from "@/types";
import { cn } from "@/lib/utils";

const ICONS: Record<RoadmapPhase["icon"], typeof Bed> = {
  rest: Bed,
  walk: PersonStanding,
  activity: Activity,
  checkup: Stethoscope,
  normal: Sun,
};

const STATUS_STYLES: Record<RoadmapPhase["status"], { badge: string; dot: string; ring: string }> = {
  completed: { badge: "bg-accent-greenSoft text-accent-green", dot: "bg-accent-green", ring: "" },
  "in-progress": { badge: "bg-accent-blueSoft text-accent-blue", dot: "bg-brand-500", ring: "ring-4 ring-brand-100" },
  upcoming: { badge: "bg-surface text-ink-500", dot: "bg-ink-300", ring: "" },
};

const STATUS_LABEL: Record<RoadmapPhase["status"], string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  upcoming: "Upcoming",
};

export function RoadmapTimeline({ phases }: { phases: RoadmapPhase[] }) {
  return (
    <ol className="relative flex flex-col gap-4 pl-4">
      <div className="absolute bottom-4 left-[27px] top-4 w-px bg-surface-border" aria-hidden />
      {phases.map((phase) => {
        const Icon = ICONS[phase.icon];
        const styles = STATUS_STYLES[phase.status];
        return (
          <li key={phase.id} className="relative flex gap-4">
            <span
              className={cn(
                "z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white",
                styles.dot,
                styles.ring
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <Card
              className={cn("flex-1", phase.status === "in-progress" && "border-brand-200 bg-brand-50/40")}
            >
              <CardBody className="!p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-ink-500">{phase.dayRange}</p>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", styles.badge)}>
                    {STATUS_LABEL[phase.status]}
                  </span>
                </div>
                <p className="mt-1 text-[15px] font-bold text-ink-900">{phase.title}</p>
                <p className="mt-1 text-xs text-ink-500">{phase.description}</p>
              </CardBody>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
