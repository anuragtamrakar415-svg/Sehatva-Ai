"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/services/api";
import { useAppStore } from "@/store/app-store";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.login(email, password);
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your recovery journey">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-lg bg-accent-redSoft px-3 py-2 text-xs font-medium text-accent-red">{error}</p>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-ink-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="focus-ring rounded-lg border border-surface-border px-3.5 py-2.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold text-ink-700">
              Password
            </label>
            <Link href="/forgot-password" className="focus-ring text-xs font-semibold text-brand-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="focus-ring rounded-lg border border-surface-border px-3.5 py-2.5 text-sm"
          />
        </div>
        <Button type="submit" className="mt-2 w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-500">
        Don&rsquo;t have an account?{" "}
        <Link href="/signup" className="focus-ring font-semibold text-brand-600 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
