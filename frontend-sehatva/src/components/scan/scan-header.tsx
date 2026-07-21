"use client";

import { PageHeader } from "@/components/common/page-header";
import { useTranslation } from "@/lib/i18n";

export function ScanHeader() {
  const { t } = useTranslation();
  return <PageHeader title={t("pages.scanTitle")} subtitle={t("pages.scanSubtitle")} />;
}
