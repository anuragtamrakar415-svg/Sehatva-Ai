import Link from "next/link";
import { ScanLine, FileText, Bot, ShieldPlus, Siren } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { icon: ScanLine, label: "AI Scan & Analyze", href: "/scan", bg: "bg-brand-50", color: "text-brand-600" },
  { icon: FileText, label: "Health Reports", href: "/reports", bg: "bg-accent-greenSoft", color: "text-accent-green" },
  { icon: Bot, label: "AI Assistant", href: "/ai-chat", bg: "bg-accent-purpleSoft", color: "text-accent-purple" },
  { icon: ShieldPlus, label: "Insurance Helper", href: "/insurance", bg: "bg-accent-orangeSoft", color: "text-accent-orange" },
  { icon: Siren, label: "SOS Emergency", href: "/caregiver#sos", bg: "bg-accent-redSoft", color: "text-accent-red" },
];

export function QuickActions() {
  return (
    <section>
      <p className="mb-3 text-[15px] font-bold text-ink-900">Quick Actions</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ACTIONS.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="focus-ring flex flex-col items-center gap-2 rounded-2xl border border-surface-border bg-surface-card p-4 text-center shadow-card transition-transform hover:-translate-y-0.5"
          >
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", a.bg)}>
              <a.icon className={cn("h-5 w-5", a.color)} />
            </span>
            <span className="text-xs font-semibold text-ink-700">{a.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
