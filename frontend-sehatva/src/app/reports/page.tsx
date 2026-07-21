"use client";

import { useEffect, useState } from "react";
import { FileText, Sparkles, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reportService } from "@/services/report.service";
import { ApiError } from "@/services/api";
import { useTranslation } from "@/lib/i18n";

interface ExplainResult {
  summary: string;
  abnormal_values?: { test: string; value: string; normal_range?: string | null; interpretation: string }[];
  important_findings?: string[];
  lifestyle_suggestions?: string[];
  doctor_consultation_advice?: string;
}

interface SavedReport {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
}

const SUBTYPES = ["CBC", "blood_sugar", "lipid_profile", "liver_function", "kidney_function", "vitamin"];

export default function ReportsPage() {
  const { t } = useTranslation();
  const [subtype, setSubtype] = useState(SUBTYPES[0]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  function loadReports() {
    setReportsLoading(true);
    reportService
      .list()
      .then((list) =>
        setReports(
          list.map((r) => ({
            id: r.id,
            title: r.report_subtype ? `${r.report_type} — ${r.report_subtype}` : r.report_type,
            summary:
              (r.ai_summary as ExplainResult | undefined)?.summary ??
              (r.status === "processing" ? "Analyzing..." : r.status === "failed" ? "Analysis failed" : "No summary"),
            createdAt: new Date(r.created_at).toLocaleDateString("en-IN"),
          }))
        )
      )
      .finally(() => setReportsLoading(false));
  }

  useEffect(loadReports, []);

  async function summarize() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const report = await reportService.explain(subtype, text);
      setResult((report.ai_summary as ExplainResult) ?? null);
      loadReports();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't generate a summary. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader title={t("pages.reportsTitle")} subtitle={t("pages.reportsSubtitle")} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardBody className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-ink-700">Report type</label>
              <select
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
              >
                {SUBTYPES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <label className="text-xs font-semibold text-ink-700">Report text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                placeholder="Paste your lab results or doctor's notes here"
                className="focus-ring resize-none rounded-lg border border-surface-border px-3 py-2 text-sm"
              />
              <p className="text-[11px] text-ink-500">
                This summary is AI-generated and not a substitute for professional medical advice.
              </p>
              {error && <p className="text-xs font-medium text-accent-red">{error}</p>}
              <Button size="sm" onClick={summarize} disabled={loading || !text.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Summarizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Explain Report
                  </>
                )}
              </Button>

              {result && (
                <div className="mt-2 rounded-xl bg-accent-purpleSoft p-4">
                  <p className="text-sm font-semibold text-ink-900">Summary</p>
                  <p className="mt-1 text-sm text-ink-700">{result.summary}</p>
                  {result.important_findings && result.important_findings.length > 0 && (
                    <>
                      <p className="mt-3 text-xs font-semibold text-ink-700">Key findings</p>
                      <ul className="mt-1 list-inside list-disc text-xs text-ink-700">
                        {result.important_findings.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {result.lifestyle_suggestions && result.lifestyle_suggestions.length > 0 && (
                    <>
                      <p className="mt-3 text-xs font-semibold text-ink-700">Recommendations</p>
                      <ul className="mt-1 list-inside list-disc text-xs text-ink-700">
                        {result.lifestyle_suggestions.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-[15px] font-bold text-ink-900">Saved Reports</p>
              {reportsLoading ? (
                <p className="py-3 text-sm text-ink-500">Loading...</p>
              ) : (
                <ul className="mt-3 flex flex-col divide-y divide-surface-border">
                  {reports.map((r) => (
                    <li key={r.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-ink-900">{r.title}</p>
                        <p className="text-xs text-ink-500">{r.summary}</p>
                        <p className="mt-0.5 text-[11px] text-ink-300">{r.createdAt}</p>
                      </div>
                    </li>
                  ))}
                  {reports.length === 0 && <p className="py-3 text-sm text-ink-500">No saved reports yet.</p>}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
