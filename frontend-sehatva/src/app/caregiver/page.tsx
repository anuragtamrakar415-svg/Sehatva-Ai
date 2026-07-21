import { AppShell } from "@/components/layout/app-shell";
import { CaregiverContent } from "@/components/caregiver/caregiver-content";

export const metadata = { title: "Caregiver — Sehatva AI" };

export default function CaregiverPage() {
  return (
    <AppShell>
      <CaregiverContent />
    </AppShell>
  );
}
