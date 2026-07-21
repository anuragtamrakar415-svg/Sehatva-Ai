import { Bot } from "lucide-react";
import Link from "next/link";

export function HelpWidget() {
  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl bg-brand-500 p-4 text-white">
      <p className="text-sm font-semibold">Need Help?</p>
      <p className="mt-0.5 text-xs text-white/80">Talk to your AI Health Assistant</p>
      <Link
        href="/ai-chat"
        className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-600"
      >
        Chat Now
      </Link>
      <Bot className="pointer-events-none absolute -bottom-2 -right-2 h-14 w-14 text-white/25" />
    </div>
  );
}
