import { AppShell } from "@/components/layout/app-shell";
import { RecoveryContent } from "@/components/recovery/recovery-content";

export const metadata = { title: "Recovery Roadmap — Sehatva AI" };

export default function RecoveryPage() {
  return (
    <AppShell>
      <RecoveryContent />
    </AppShell>
  );
}
