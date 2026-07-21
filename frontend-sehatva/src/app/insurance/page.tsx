"use client";

import { useEffect, useState } from "react";
import { ShieldPlus, FileCheck2, Clock3, XCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { useTranslation } from "@/lib/i18n";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { insuranceService, type InsuranceClaim } from "@/services/insurance.service";

const STATUS_META: Record<string, { icon: typeof FileCheck2; className: string }> = {
  ready: { icon: FileCheck2, className: "bg-accent-greenSoft text-accent-green" },
  pending: { icon: Clock3, className: "bg-accent-orangeSoft text-accent-orange" },
  failed: { icon: XCircle, className: "bg-accent-redSoft text-accent-red" },
};

function statusMeta(status: string) {
  return STATUS_META[status] ?? STATUS_META.pending;
}

export default function InsurancePage() {
  const { t } = useTranslation();
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [surgery, setSurgery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    insuranceService
      .listClaims()
      .then(setClaims)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSuggest() {
    if (!diagnosis.trim()) return;
    setSubmitting(true);
    try {
      await insuranceService.suggest({ diagnosis, surgery: surgery || undefined });
      setDiagnosis("");
      setSurgery("");
      setShowForm(false);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t("pages.insuranceTitle")}
          subtitle={t("pages.insuranceSubtitle")}
          actions={
            <Button size="sm" onClick={() => setShowForm((v) => !v)}>
              <ShieldPlus className="h-4 w-4" /> New Suggestion
            </Button>
          }
        />

        {showForm && (
          <Card>
            <CardBody className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink-700">Diagnosis</label>
                <input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Knee replacement recovery"
                  className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink-700">Surgery (optional)</label>
                <input
                  value={surgery}
                  onChange={(e) => setSurgery(e.target.value)}
                  placeholder="e.g. Total Knee Arthroplasty"
                  className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                />
              </div>
              <Button size="sm" onClick={handleSuggest} disabled={submitting} className="self-start">
                {submitting ? "Generating..." : "Get AI Suggestion"}
              </Button>
            </CardBody>
          </Card>
        )}

        {loading ? (
          <p className="text-sm text-ink-500">Loading...</p>
        ) : claims.length === 0 ? (
          <p className="text-sm text-ink-500">
            No insurance suggestions yet. Click &ldquo;New Suggestion&rdquo; and describe your diagnosis to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {claims.map((c) => {
              const meta = statusMeta(c.status);
              return (
                <Card key={c.id}>
                  <CardBody className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", meta.className)}>
                        <meta.icon className="h-5 w-5" />
                      </span>
                      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold capitalize", meta.className)}>
                        {c.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-ink-900">{c.diagnosis ?? "Insurance suggestion"}</p>
                      {c.surgery && <p className="text-xs text-ink-500">{c.surgery}</p>}
                    </div>
                    {c.estimated_coverage_note && (
                      <p className="text-sm text-ink-700">{c.estimated_coverage_note}</p>
                    )}
                    {Array.isArray(c.claim_checklist) && c.claim_checklist.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-ink-700">Checklist</p>
                        <ul className="mt-1 list-inside list-disc text-xs text-ink-500">
                          {c.claim_checklist.slice(0, 4).map((item, i) => (
                            <li key={i}>{String(item)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
