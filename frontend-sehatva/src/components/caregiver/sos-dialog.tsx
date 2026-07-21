"use client";

import { useRef, useState } from "react";
import { Siren, Phone, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { sosService } from "@/services/sos.service";
import { useTranslation } from "@/lib/i18n";

const HOLD_MS = 1200;

export function SosDialog() {
  const { caregivers } = useAppStore();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activated, setActivated] = useState(false);
  const [sending, setSending] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  function startHold() {
    setHolding(true);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - startRef.current) / HOLD_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        setActivated(true);
        setHolding(false);
        triggerSos();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  async function triggerSos() {
    setSending(true);
    try {
      await sosService.trigger();
    } catch {
      // Even if the network call fails, keep the on-screen confirmation - the
      // person is in an emergency and needs the ambulance/caregiver numbers regardless.
    } finally {
      setSending(false);
    }
  }

  function cancelHold() {
    setHolding(false);
    setProgress(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }

  function closeDialog() {
    setOpen(false);
    setActivated(false);
    cancelHold();
  }

  return (
    <>
      {/* Fixed, always-reachable emergency button - separate from any page's content,
          so it's available from anywhere in the app, not just the Caregiver page. */}
      <button
        onClick={() => setOpen(true)}
        aria-label={t("sos.title")}
        className="focus-ring fixed bottom-6 right-6 z-40 flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full bg-accent-red text-white shadow-[0_8px_24px_rgba(239,68,68,0.45)] transition-transform hover:scale-105 active:scale-95 sm:bottom-8 sm:right-8"
      >
        <Siren className="h-6 w-6" />
        <span className="text-[10px] font-bold leading-none">{t("sos.button")}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-surface-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-ink-900">{t("sos.title")}</p>
              <button onClick={closeDialog} aria-label="Close" className="focus-ring text-ink-500 hover:text-ink-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!activated ? (
              <>
                <p className="mt-2 text-sm text-ink-500">{t("sos.instructions")}</p>
                <button
                  onMouseDown={startHold}
                  onMouseUp={cancelHold}
                  onMouseLeave={cancelHold}
                  onTouchStart={startHold}
                  onTouchEnd={cancelHold}
                  className="focus-ring relative mx-auto mt-6 flex h-32 w-32 items-center justify-center rounded-full bg-accent-red text-white"
                  style={{
                    background: `conic-gradient(#ffffff66 ${progress}%, #EF4444 ${progress}%)`,
                  }}
                >
                  <span className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-red">
                    <Siren className="h-10 w-10" />
                  </span>
                </button>
                <p className="mt-3 text-center text-xs text-ink-500">{holding ? t("sos.holding") : t("sos.hold")}</p>
              </>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <div className="rounded-xl bg-accent-greenSoft p-3 text-center text-sm font-semibold text-accent-green">
                  {sending ? t("sos.sending") : t("sos.sent")}
                </div>
                <a
                  href="tel:108"
                  className="focus-ring flex items-center justify-center gap-2 rounded-lg bg-accent-red px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Phone className="h-4 w-4" /> {t("sos.callAmbulance")}
                </a>
                {caregivers.map((c) => (
                  <a
                    key={c.id}
                    href={`tel:${c.phone.replace(/\s/g, "")}`}
                    className="focus-ring flex items-center justify-between gap-2 rounded-lg border border-surface-border px-4 py-2.5 text-sm font-medium text-ink-900"
                  >
                    <span>
                      {c.name} <span className="text-ink-500">({c.relation})</span>
                    </span>
                    <Phone className="h-4 w-4 text-accent-green" />
                  </a>
                ))}
                {caregivers.length === 0 && (
                  <p className="text-center text-xs text-ink-500">{t("sos.noCaregivers")}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
