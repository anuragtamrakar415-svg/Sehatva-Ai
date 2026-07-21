import { Award, Droplet, Footprints, BookOpen, Sunrise, Smile, CalendarCheck, Trophy } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import type { Badge as BadgeType } from "@/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Award> = {
  "Medicine Master": Award,
  "Hydration Hero": Droplet,
  "Walking Warrior": Footprints,
  "Report Reader": BookOpen,
  "Early Bird": Sunrise,
  "Positive Attitude": Smile,
  "Follow-up Star": CalendarCheck,
  "Recovery Champion": Trophy,
};

export function MilestoneBadges({ badges }: { badges: BadgeType[] }) {
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-ink-900">Milestone Badges</p>
          <span className="text-sm font-bold text-brand-600">
            {earnedCount}/{badges.length}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-ink-500">Badges Earned</p>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {badges.map((b) => {
            const Icon = ICONS[b.label] ?? Award;
            return (
              <div key={b.id} className="flex flex-col items-center gap-1.5 text-center">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full",
                    b.earned ? "bg-accent-orangeSoft text-accent-orange" : "bg-surface text-ink-300"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className={cn("text-[10px] font-medium leading-tight", b.earned ? "text-ink-700" : "text-ink-300")}>
                  {b.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
