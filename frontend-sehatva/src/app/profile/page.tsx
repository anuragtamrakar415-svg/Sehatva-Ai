"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { useTranslation } from "@/lib/i18n";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { profileService, type ProfileData } from "@/services/profile.service";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ age: "", weight_kg: "", height_cm: "", blood_group: "" });

  function loadProfile() {
    setLoading(true);
    profileService
      .get()
      .then((d) => {
        setData(d);
        setForm({
          age: d.profile.age?.toString() ?? "",
          weight_kg: d.profile.weight_kg?.toString() ?? "",
          height_cm: d.profile.height_cm?.toString() ?? "",
          blood_group: d.profile.blood_group ?? "",
        });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function saveProfile() {
    setSaving(true);
    setError(null);
    try {
      const updated = await profileService.update({
        age: form.age ? Number(form.age) : undefined,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
        height_cm: form.height_cm ? Number(form.height_cm) : undefined,
        blood_group: form.blood_group || undefined,
      });
      setData(updated);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const initials = data?.user.name
    ? data.user.name.split(" ").map((p) => p[0]).join("")
    : "--";
  const primaryContact = data?.profile.emergency_contacts[0];

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader title={t("pages.profileTitle")} subtitle={t("pages.profileSubtitle")} />

        {loading ? (
          <p className="text-sm text-ink-500">Loading profile...</p>
        ) : (
          <>
            <Card>
              <CardBody className="flex flex-col items-center gap-3 py-8 text-center sm:flex-row sm:text-left">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
                  {initials}
                </span>
                <div className="flex-1">
                  <p className="text-xl font-bold text-ink-900">{data?.user.name ?? "-"}</p>
                  <p className="text-sm text-ink-500">
                    {data?.profile.medical_history || "No medical history on file yet"}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-ink-500 sm:justify-start">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {data?.user.email ?? "-"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {data?.user.phone ?? "Not added"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {data?.profile.blood_group ?? "-"}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setEditing((v) => !v)}>
                  {editing ? "Cancel" : "Edit Profile"}
                </Button>
              </CardBody>
            </Card>

            {editing && (
              <Card>
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-ink-900">Edit medical details</p>
                    <button
                      aria-label="Close"
                      onClick={() => setEditing(false)}
                      className="focus-ring text-ink-400 hover:text-ink-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-ink-700">Age</label>
                      <input
                        type="number"
                        min={0}
                        value={form.age}
                        onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                        className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-ink-700">Weight (kg)</label>
                      <input
                        type="number"
                        min={0}
                        value={form.weight_kg}
                        onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
                        className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-ink-700">Height (cm)</label>
                      <input
                        type="number"
                        min={0}
                        value={form.height_cm}
                        onChange={(e) => setForm((f) => ({ ...f, height_cm: e.target.value }))}
                        className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-ink-700">Blood group</label>
                      <input
                        value={form.blood_group}
                        onChange={(e) => setForm((f) => ({ ...f, blood_group: e.target.value }))}
                        className="focus-ring rounded-lg border border-surface-border px-3 py-2 text-sm"
                        placeholder="O+"
                      />
                    </div>
                  </div>
                  {error && <p className="text-xs font-semibold text-accent-red">{error}</p>}
                  <div>
                    <Button size="sm" onClick={saveProfile} disabled={saving}>
                      {saving ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Age", value: data?.profile.age ? `${data.profile.age} yrs` : "-" },
                { label: "Blood Group", value: data?.profile.blood_group ?? "-" },
                { label: "Emergency Contact", value: primaryContact?.name ?? "None added" },
              ].map((item) => (
                <Card key={item.label}>
                  <CardBody>
                    <p className="text-xs font-medium text-ink-500">{item.label}</p>
                    <p className="mt-1 text-lg font-bold text-ink-900">{item.value}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
