"use client";

import { useState } from "react";
import { Phone, Plus, UserPlus, X } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { caregiverService } from "@/services/caregiver.service";
import { useTranslation } from "@/lib/i18n";

export function CaregiverContent() {
  const { caregivers, refresh } = useAppStore();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function addCaregiver() {
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    try {
      await caregiverService.add({ name, relation: relation || undefined, phone });
      await refresh();
      setName("");
      setRelation("");
      setPhone("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("pages.caregiverTitle")}
        subtitle={t("pages.caregiverSubtitle")}
        actions={
          <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>
            <UserPlus className="h-4 w-4" /> Add Caregiver
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                placeholder="Priya Sharma"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-700">Relation</label>
              <input
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                placeholder="Daughter"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-700">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                placeholder="+91 98765 43210"
              />
            </div>
            <Button size="sm" onClick={addCaregiver} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <button
              aria-label="Cancel"
              onClick={() => setShowForm(false)}
              className="focus-ring text-ink-400 hover:text-ink-700"
            >
              <X className="h-4 w-4" />
            </button>
          </CardBody>
        </Card>
      )}

      <div id="sos" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {caregivers.map((c) => (
          <Card key={c.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {c.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">{c.name}</p>
                  <p className="text-xs text-ink-500">{c.relation}</p>
                </div>
              </div>
              <a
                href={`tel:${c.phone.replace(/\s/g, "")}`}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-accent-greenSoft text-accent-green"
                aria-label={`Call ${c.name}`}
              >
                <Phone className="h-4 w-4" />
              </a>
            </CardBody>
          </Card>
        ))}
        {caregivers.length === 0 && (
          <p className="text-sm text-ink-500">No caregivers added yet.</p>
        )}
        <Card className="flex items-center justify-center border-dashed">
          <button onClick={() => setShowForm(true)} className="w-full">
            <CardBody className="flex flex-col items-center gap-2 py-6 text-center">
              <Plus className="h-5 w-5 text-ink-300" />
              <p className="text-xs text-ink-500">Add another caregiver</p>
            </CardBody>
          </button>
        </Card>
      </div>
    </div>
  );
}
