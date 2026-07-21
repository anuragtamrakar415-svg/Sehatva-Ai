import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
      <p className="text-3xl font-bold text-brand-500">404</p>
      <p className="text-lg font-bold text-ink-900">Page not found</p>
      <p className="max-w-sm text-sm text-ink-500">The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
      <Link href="/dashboard" className="focus-ring rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
        Back to Dashboard
      </Link>
    </div>
  );
}
