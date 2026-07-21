"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { useTranslation } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { aiService } from "@/services/ai.service";
import type { ChatMessage } from "@/types";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm your AI Health Assistant. Ask me about your medicines, recovery plan, or symptoms.",
  createdAt: "now",
};

export default function AiChatPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiService
      .chatHistory()
      .then((history) => {
        if (history.length > 0) {
          setMessages([
            WELCOME,
            ...history.map((h) => ({
              id: h.id,
              role: h.role === "user" ? ("user" as const) : ("assistant" as const),
              content: h.message,
              createdAt: h.created_at,
            })),
          ]);
        }
      })
      .catch(() => {
        // History load is best-effort; chat still works without it.
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || sending) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: input, createdAt: "now" };
    setMessages((prev) => [...prev, userMsg]);
    const text = input;
    setInput("");
    setSending(true);
    try {
      const res = await aiService.chat(text);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: res.reply, createdAt: "now" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I couldn't reach the assistant right now. Please try again in a moment.",
          createdAt: "now",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-140px)] flex-col gap-4">
        <PageHeader title={t("pages.aiChatTitle")} subtitle={t("pages.aiChatSubtitle")} />

        <Card className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex items-start gap-3", m.role === "user" && "flex-row-reverse")}>
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    m.role === "user" ? "bg-brand-100 text-brand-700" : "bg-accent-purpleSoft text-accent-purple"
                  )}
                >
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </span>
                <p
                  className={cn(
                    "max-w-md rounded-2xl px-4 py-2.5 text-sm",
                    m.role === "user" ? "bg-brand-500 text-white" : "bg-surface text-ink-700"
                  )}
                >
                  {m.content}
                </p>
              </div>
            ))}
            {sending && <p className="pl-11 text-xs text-ink-400">Thinking...</p>}
            <div ref={bottomRef} />
          </div>
          <div className="flex items-center gap-2 border-t border-surface-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about medicines, symptoms, or your recovery plan..."
              className="focus-ring flex-1 rounded-xl border border-surface-border px-4 py-2.5 text-sm"
            />
            <button
              onClick={send}
              disabled={sending}
              aria-label="Send message"
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
