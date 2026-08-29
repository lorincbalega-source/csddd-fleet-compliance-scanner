"use client";

import { useState } from "react";
import { Mail, Copy, Check, Send } from "lucide-react";
import type { FollowUpEmail } from "@/lib/types";
import type { Translations } from "@/lib/translations";

interface FollowUpEmailTemplateProps {
  email: FollowUpEmail;
  t: Translations;
}

export function FollowUpEmailTemplate({ email, t }: FollowUpEmailTemplateProps) {
  const [copied, setCopied] = useState(false);

  const fullText = `Subject: ${email.subject}\n\n${email.body}`;
  const mailto = `mailto:?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <div className="flex flex-col gap-4 border-b border-slate-800 bg-slate-950 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{t.email.title}</h2>
            <p className="mt-0.5 text-sm text-slate-400">{t.email.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 text-sm font-medium text-white hover:bg-white/10"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                {t.email.copied}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {t.email.copy}
              </>
            )}
          </button>
          <a
            href={mailto}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand-600 px-3.5 text-sm font-semibold text-white hover:bg-brand-500"
          >
            <Send className="h-4 w-4" />
            {t.email.send}
          </a>
        </div>
      </div>

      <div className="space-y-4 p-6">
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {t.email.subject}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{email.subject}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {t.email.body}
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
            {email.body}
          </pre>
        </div>
      </div>
    </section>
  );
}
