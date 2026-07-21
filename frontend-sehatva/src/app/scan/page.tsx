import { AppShell } from "@/components/layout/app-shell";
import { ScanHeader } from "@/components/scan/scan-header";
import { ScanScreen } from "@/components/scan/scan-screen";

export const metadata = { title: "AI Scan & Analyze — Sehatva AI" };

export default function ScanPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <ScanHeader />
        <ScanScreen />
      </div>
    </AppShell>
  );
}
