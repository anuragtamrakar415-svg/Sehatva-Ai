"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Settings, User as UserIcon, CheckCheck } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { notificationService, type BackendNotification } from "@/services/notification.service";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

function useClickOutside(ref: React.RefObject<HTMLElement>, onOutside: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BackendNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const { t } = useTranslation();

  const unreadCount = items.filter((n) => !n.is_read).length;

  function load() {
    setLoading(true);
    notificationService
      .list()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    try {
      await notificationService.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // non-fatal
    }
  }

  async function markOneRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await notificationService.markRead(id);
    } catch {
      // non-fatal, optimistic update stands
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-surface"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-red text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-20 w-80 rounded-xl border border-surface-border bg-surface-card shadow-pop">
          <div className="flex items-center justify-between border-b border-surface-border px-4 py-2.5">
            <p className="text-sm font-bold text-ink-900">{t("common.notifications")}</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="focus-ring flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> {t("common.markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-xs text-ink-500">{t("common.loading")}</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-ink-500">{t("common.caughtUp")}</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markOneRead(n.id)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 border-b border-surface-border px-4 py-2.5 text-left last:border-b-0 hover:bg-surface",
                    !n.is_read && "bg-brand-50/50"
                  )}
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                    {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                    {n.title}
                  </span>
                  {n.message && <span className="text-xs text-ink-500">{n.message}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AvatarMenu() {
  const { user, logout } = useAppStore();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const name = user?.name ?? "";
  const initials = name.split(" ").map((p) => p[0]).join("") || "?";

  function handleLogout() {
    setOpen(false);
    logout();
    router.replace("/login");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="focus-ring flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
          {initials}
        </span>
        <span className="text-sm font-medium text-ink-900">{name}</span>
        <ChevronDown className={cn("h-4 w-4 text-ink-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-20 w-52 rounded-xl border border-surface-border bg-surface-card py-1.5 shadow-pop">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="focus-ring flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-surface"
          >
            <UserIcon className="h-4 w-4" /> {t("nav.profile")}
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="focus-ring flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-surface"
          >
            <Settings className="h-4 w-4" /> {t("nav.settings")}
          </Link>
          <div className="my-1.5 border-t border-surface-border" />
          <button
            onClick={handleLogout}
            className="focus-ring flex w-full items-center gap-2.5 px-4 py-2 text-sm font-medium text-accent-red hover:bg-surface"
          >
            <LogOut className="h-4 w-4" /> {t("common.logout")}
          </button>
        </div>
      )}
    </div>
  );
}

export function Topbar({ actions }: { actions?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-end gap-4 border-b border-surface-border bg-surface-card/90 px-6 py-3.5 backdrop-blur">
      {actions}
      <NotificationMenu />
      <AvatarMenu />
    </header>
  );
}
