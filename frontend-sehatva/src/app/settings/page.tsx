"use client";

import { Moon, Sun, Globe, Type, Bell } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { useTranslation, SUPPORTED_LANGUAGES } from "@/lib/i18n";

const FONT_SIZES = [
  { key: "sm" as const, label: "A-" },
  { key: "md" as const, label: "A" },
  { key: "lg" as const, label: "A+" },
];

export default function SettingsPage() {
  const { theme, toggleTheme, language, setLanguage, fontSize, setFontSize } = useAppStore();
  const { t } = useTranslation();

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

        <Card>
          <CardBody className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </span>
              <div>
                <p className="text-sm font-bold text-ink-900">{t("settings.appearance")}</p>
                <p className="text-xs text-ink-500">{t("settings.appearanceDesc")}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={cn(
                "focus-ring relative h-7 w-12 rounded-full transition-colors",
                theme === "dark" ? "bg-brand-500" : "bg-ink-100"
              )}
              aria-label="Toggle dark mode"
            >
              <span
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purpleSoft text-accent-purple">
                <Globe className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink-900">{t("settings.language")}</p>
                <p className="text-xs text-ink-500">{t("settings.languageDesc")}</p>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="focus-ring rounded-lg border border-surface-border bg-surface-card px-3 py-1.5 text-sm text-ink-900"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-orangeSoft text-accent-orange">
                <Type className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink-900">{t("settings.textSize")}</p>
                <p className="text-xs text-ink-500">{t("settings.textSizeDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {FONT_SIZES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setFontSize(s.key)}
                  aria-pressed={fontSize === s.key}
                  className={cn(
                    "focus-ring rounded-lg border px-2.5 py-1 text-xs font-semibold hover:bg-surface",
                    fontSize === s.key
                      ? "border-brand-500 bg-brand-50 text-brand-600"
                      : "border-surface-border text-ink-700"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-greenSoft text-accent-green">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-ink-900">{t("settings.reminders")}</p>
                <p className="text-xs text-ink-500">{t("settings.remindersDesc")}</p>
              </div>
            </div>
            <button
              className="focus-ring relative h-7 w-12 rounded-full bg-brand-500"
              aria-label="Toggle medicine reminders"
            >
              <span className="absolute top-1 h-5 w-5 translate-x-6 rounded-full bg-white shadow" />
            </button>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
