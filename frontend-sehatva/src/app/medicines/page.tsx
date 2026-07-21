"use client";

import { useState } from "react";
import { Plus, Pill, CheckCircle2, Circle, X, Sparkles, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { medicineService } from "@/services/medicine.service";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const TIMING_OPTIONS = ["morning", "afternoon", "evening", "night"] as const;
const FOOD_OPTIONS = [
  { value: "before_food", label: "Before food" },
  { value: "after_food", label: "After food" },
  { value: "with_food", label: "With food" },
] as const;

export default function MedicinesPage() {
  const { medicines, toggleMedicine, refresh } = useAppStore();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timing, setTiming] = useState<(typeof TIMING_OPTIONS)[number]>("morning");
  const [foodRelation, setFoodRelation] = useState<(typeof FOOD_OPTIONS)[number]["value"]>("after_food");
  const [stock, setStock] = useState("30");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [explaining, setExplaining] = useState<string | null>(null);

  async function explainMedicine(medicineId: string) {
    if (explanations[medicineId]) {
      setExplanations((prev) => {
        const next = { ...prev };
        delete next[medicineId];
        return next;
      });
      return;
    }
    setExplaining(medicineId);
    try {
      const { explanation } = await medicineService.explain(medicineId);
      setExplanations((prev) => ({ ...prev, [medicineId]: explanation }));
    } catch {
      setExplanations((prev) => ({ ...prev, [medicineId]: "Couldn't fetch an explanation right now. Please try again." }));
    } finally {
      setExplaining(null);
    }
  }

  async function addMedicine() {
    if (!name.trim()) {
      setError("Medicine name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await medicineService.create({
        name: name.trim(),
        dosage: dosage.trim() || undefined,
        timing,
        food_relation: foodRelation,
        stock: Number(stock) || 0,
      });
      await refresh();
      setName("");
      setDosage("");
      setTiming("morning");
      setFoodRelation("after_food");
      setStock("30");
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add medicine");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">{t("pages.medicinesTitle")}</h1>
            <p className="mt-1 text-sm text-ink-500">{t("pages.medicinesSubtitle")}</p>
          </div>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" /> Add Medicine
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardBody className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink-900">New medicine</p>
                <button
                  aria-label="Cancel"
                  onClick={() => setShowForm(false)}
                  className="focus-ring text-ink-400 hover:text-ink-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink-700">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                    placeholder="Paracetamol"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink-700">Dosage</label>
                  <input
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                    placeholder="500mg"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink-700">Timing</label>
                  <select
                    value={timing}
                    onChange={(e) => setTiming(e.target.value as typeof timing)}
                    className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm capitalize"
                  >
                    {TIMING_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink-700">Food relation</label>
                  <select
                    value={foodRelation}
                    onChange={(e) => setFoodRelation(e.target.value as typeof foodRelation)}
                    className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                  >
                    {FOOD_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink-700">Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                  />
                </div>
              </div>
              {error && <p className="text-xs font-semibold text-accent-red">{error}</p>}
              <div>
                <Button size="sm" onClick={addMedicine} disabled={saving}>
                  {saving ? "Saving..." : "Save medicine"}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {medicines.map((m) => (
            <Card key={m.id}>
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Pill className="h-5 w-5" />
                  </span>
                  <button
                    onClick={() => toggleMedicine(m.id)}
                    className="focus-ring flex items-center gap-1.5 text-xs font-semibold"
                  >
                    {m.taken ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-accent-green" />
                        <span className="text-accent-green">Taken</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 text-ink-300" />
                        <span className="text-ink-500">Mark taken</span>
                      </>
                    )}
                  </button>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-ink-900">{m.name}</p>
                  <p className="text-xs text-ink-500">{m.dosage}</p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-700">{m.time}</span>
                  <span className={cn("font-semibold", m.stock <= 8 ? "text-accent-orange" : "text-ink-500")}>
                    {m.stock} left in stock
                  </span>
                </div>
                <button
                  onClick={() => explainMedicine(m.medicineId)}
                  disabled={explaining === m.medicineId}
                  className="focus-ring flex items-center gap-1.5 self-start text-xs font-semibold text-brand-600 hover:underline disabled:opacity-60"
                >
                  {explaining === m.medicineId ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {explanations[m.medicineId] ? "Hide explanation" : "Explain this medicine"}
                </button>
                {explanations[m.medicineId] && (
                  <p className="rounded-lg bg-surface px-3 py-2 text-xs leading-relaxed text-ink-700">
                    {explanations[m.medicineId]}
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
