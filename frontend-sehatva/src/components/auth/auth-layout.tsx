import { HeartPulse } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-800 to-brand-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <HeartPulse className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <p className="text-[15px] font-bold">Sehatva AI</p>
        </div>
        <div className="max-w-sm">
          <p className="text-3xl font-bold leading-tight">Smart Care. Better Recovery.</p>
          <p className="mt-3 text-sm text-white/80">
            Track medicines, follow your AI-guided recovery roadmap, and stay connected with caregivers — all in
            one place.
          </p>
        </div>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} Sehatva AI</p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-surface px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
          <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
