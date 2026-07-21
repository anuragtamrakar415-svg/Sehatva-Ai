"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
      <p className="text-lg font-bold text-ink-900">Something went wrong</p>
      <p className="max-w-sm text-sm text-ink-500">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="focus-ring rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
      >
        Try again
      </button>
    </div>
  );
}
