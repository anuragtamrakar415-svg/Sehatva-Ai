import type { NavKey } from "@/types";

export interface NavItem {
  key: NavKey;
  label: string;
  href: string;
  icon:
    | "dashboard"
    | "recovery"
    | "medicines"
    | "scan"
    | "reports"
    | "ai-chat"
    | "insurance"
    | "caregiver"
    | "sos"
    | "profile"
    | "settings";
}

export const PRIMARY_NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { key: "recovery", label: "Recovery Roadmap", href: "/recovery", icon: "recovery" },
  { key: "medicines", label: "Medicines", href: "/medicines", icon: "medicines" },
  { key: "scan", label: "AI Scan & Analyze", href: "/scan", icon: "scan" },
  { key: "reports", label: "Health Reports", href: "/reports", icon: "reports" },
  { key: "ai-chat", label: "AI Assistant", href: "/ai-chat", icon: "ai-chat" },
  { key: "insurance", label: "Insurance Helper", href: "/insurance", icon: "insurance" },
  { key: "caregiver", label: "Caregiver", href: "/caregiver", icon: "caregiver" },
];

export const SECONDARY_NAV: NavItem[] = [
  { key: "profile", label: "Profile", href: "/profile", icon: "profile" },
  { key: "settings", label: "Settings", href: "/settings", icon: "settings" },
];
