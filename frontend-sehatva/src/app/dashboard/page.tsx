import { AppShell } from "@/components/layout/app-shell";
import { Greeting } from "@/components/dashboard/greeting";
import { RecoveryProgressCard } from "@/components/dashboard/recovery-progress-card";
import { StatCards } from "@/components/dashboard/stat-cards";
import { RoadmapTeaserCard } from "@/components/dashboard/roadmap-teaser-card";
import { AiSummaryCard } from "@/components/dashboard/ai-summary-card";
import { CaregiverUpdateCard } from "@/components/dashboard/caregiver-update-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { HydrationTracker } from "@/components/dashboard/hydration-tracker";

export const metadata = { title: "Dashboard — Sehatva AI" };

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <Greeting />
        </div>

        <RecoveryProgressCard />

        <StatCards />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <RoadmapTeaserCard />
          <AiSummaryCard />
          <CaregiverUpdateCard />
        </div>

        <QuickActions />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <HydrationTracker />
        </div>
      </div>
    </AppShell>
  );
}
