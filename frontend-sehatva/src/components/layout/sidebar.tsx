"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/constants/nav";
import { NavIcon } from "@/components/ui/nav-icon";
import { HelpWidget } from "./help-widget";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

function NavLink({ href, icon, label }: { href: string; icon: Parameters<typeof NavIcon>[0]["icon"]; label: string }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  return (
    <Link
      href={href}
      className={cn(
        "focus-ring flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
        isActive ? "bg-brand-50 text-brand-600" : "text-ink-500 hover:bg-surface hover:text-ink-900"
      )}
    >
      <NavIcon icon={icon} className="h-[18px] w-[18px]" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-surface-border bg-surface-card px-4 py-5 lg:flex">
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-pop">
          <HeartPulse className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-bold text-ink-900">Sehatva AI</p>
          <p className="text-[11px] text-ink-500">Smart Care. Better Recovery.</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.key} href={item.href} icon={item.icon} label={t(`nav.${item.key}`)} />
        ))}
      </nav>

      <div className="flex-1" />

      <HelpWidget />

      <div className="mt-3 flex flex-col gap-1 border-t border-surface-border pt-3">
        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.key} href={item.href} icon={item.icon} label={t(`nav.${item.key}`)} />
        ))}
      </div>
    </aside>
  );
}
