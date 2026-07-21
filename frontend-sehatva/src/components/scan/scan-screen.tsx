"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, UploadCloud, Loader2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reportService, type DischargeSummary } from "@/services/report.service";
import { medicineService } from "@/services/medicine.service";
import { ApiError } from "@/services/api";

export function ScanScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DischargeSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function runScan() {
    if (!file) {
      inputRef.current?.click();
      return;
    }
    setStatus("scanning");
    setError(null);
    try {
      const report = await reportService.analyzeDischargeSummary(file);
      setResult((report.ai_summary as DischargeSummary) ?? null);
      setStatus("done");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't analyze this file. Please try again.");
      setStatus("error");
    }
  }

  const medicines = result?.medicines ?? [];

  async function addAllToMedicines() {
    setAdding(true);
    try {
      await Promise.all(
        medicines.map((m) =>
          medicineService.create({
            name: m.name,
            dosage: m.dosage ?? m.frequency ?? undefined,
          })
        )
      );
      router.push("/medicines");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn't add these medicines. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardBody className="flex flex-col items-center justify-center gap-4 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <UploadCloud className="h-7 w-7" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-ink-900">Upload a discharge summary or prescription</p>
            <p className="mt-1 text-xs text-ink-500">JPG, PNG, PDF up to 10MB — analyzed securely with AI</p>
            {file && <p className="mt-2 text-xs font-medium text-brand-600">{file.name}</p>}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf,.docx"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button size="sm" onClick={runScan} disabled={status === "scanning"}>
            {status === "scanning" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Scanning...
              </>
            ) : (
              <>
                <ScanLine className="h-4 w-4" /> {file ? "Start AI Scan" : "Choose File"}
              </>
            )}
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="text-[15px] font-bold text-ink-900">Scan Results</p>
          {status === "error" && <p className="mt-3 text-sm text-accent-red">{error}</p>}
          {status !== "done" && status !== "error" ? (
            <p className="mt-3 text-sm text-ink-500">Upload a file and run a scan to see extracted medicines here.</p>
          ) : status === "done" ? (
            <>
              {result?.plain_language_summary && (
                <p className="mt-3 text-sm text-ink-700">{result.plain_language_summary}</p>
              )}
              {medicines.length > 0 ? (
                <ul className="mt-3 flex flex-col divide-y divide-surface-border">
                  {medicines.map((item, i) => (
                    <li key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <span className="text-sm font-medium text-ink-900">{item.name}</span>
                      <span className="text-xs text-ink-500">
                        {[item.dosage, item.frequency].filter(Boolean).join(", ") || "-"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-500">No medicines were detected in this document.</p>
              )}
              {medicines.length > 0 && (
                <Button size="sm" variant="secondary" className="mt-4" onClick={addAllToMedicines} disabled={adding}>
                  {adding ? "Adding..." : "Add to Medicines"}
                </Button>
              )}
            </>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
