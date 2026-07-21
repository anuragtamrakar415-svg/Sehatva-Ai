import { Bot, Quote } from "lucide-react";

export function AiMotivationCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-accent-purpleSoft p-5">
      <p className="flex items-center gap-1.5 text-sm font-bold text-accent-purple">
        <Quote className="h-4 w-4" /> AI Motivation
      </p>
      <p className="mt-2 text-sm italic leading-relaxed text-ink-700">
        Every small step you take today brings you closer to a stronger and healthier tomorrow.
      </p>
      <Bot className="pointer-events-none absolute -bottom-3 -right-2 h-16 w-16 text-accent-purple/20" />
    </div>
  );
}
