"use client";

import { useAppStore } from "@/store/app-store";
import { useTranslation } from "@/lib/i18n";

export function Greeting() {
  const { user } = useAppStore();
  const { t } = useTranslation();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">
        {t("dashboard.greeting")}, {user?.name ?? firstName} 👋
      </h1>
      <p className="mt-1 text-sm text-ink-500">{t("dashboard.subtitle")}</p>
    </div>
  );
}
