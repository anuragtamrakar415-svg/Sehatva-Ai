import {
  LayoutDashboard,
  Map,
  Pill,
  ScanLine,
  FileText,
  Bot,
  ShieldPlus,
  Users,
  Siren,
  User,
  Settings,
} from "lucide-react";
import type { NavItem } from "@/constants/nav";

const ICONS: Record<NavItem["icon"], typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  recovery: Map,
  medicines: Pill,
  scan: ScanLine,
  reports: FileText,
  "ai-chat": Bot,
  insurance: ShieldPlus,
  caregiver: Users,
  sos: Siren,
  profile: User,
  settings: Settings,
};

export function NavIcon({ icon, className }: { icon: NavItem["icon"]; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon className={className} strokeWidth={2} />;
}
