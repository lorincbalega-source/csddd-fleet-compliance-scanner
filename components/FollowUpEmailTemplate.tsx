"use client";

import { useEffect, useState } from "react";
import { Mail, Copy, Check, Send, Loader2 } from "lucide-react";
import type { AuditResult, FollowUpEmail } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { EMAIL_RECIPIENT_LANGUAGES, recipientLanguageLabel } from "@/lib/languages";

interface FollowUpEmailTemplateProps {
  result: AuditResult;
  t: Translations;
}

export function FollowUpEmailTemplate({ result, t }: FollowUpEmailTemplateProps) {
  const [copied, setCopied] = useState(false);
  const [recipientLanguage, setRecipientLanguage] = useState("en");
  const [email, setEmail] = useState<FollowUpEmail>(result.followUpEmail);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmail(result.followUpEmail);
    setRecipientLanguage("en");
    setError(null);
  }, [result]);

  const fullText = `Subject: ${email.subject}\n\n${email.body}`;
  const mailto = `mailto:?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = async (languageId: string) => {
    setRecipientLanguage(languageId);
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/audit/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientLanguage: languageId,
          document: result.document,
          discrepancies: result.discrepancies,
          checklist: result.checklist,
          sourceFile: result.sourceFile,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(t.email.regenerateFailed);
        return;
      }

      setEmail({
        subject: String(data.subject ?? ""),
        body: String(data.body ?? ""),
      });
    } catch {
      setError(t.email.regenerateFailed);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <div className="flex flex-col gap-4 border-b border-slate-800 bg-slate-950 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{t.email.title}</h2>
            <p className="mt-0.5 text-sm text-slate-400">{t.email.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-w-[260px] flex-1 flex-col gap-1 sm:min-w-[280px]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {t.email.recipientLanguage}
            </span>
            <select
              value={recipientLanguage}
              disabled={isGenerating}
              onChange={(e) => void handleLanguageChange(e.target.value)}
              className="min-h-10 rounded-xl border border-white/15 bg-white/5 px-3 text-sm font-medium text-white outline-none ring-brand-500 focus:ring-2 disabled:opacity-60"
            >
              <optgroup label={t.email.europeGroup} className="text-slate-900">
                {EMAIL_RECIPIENT_LANGUAGES.filter((lang) => lang.region === "europe").map((lang) => (
                  <option key={lang.id} value={lang.id} className="text-slate-900">
                    {lang.flag} {recipientLanguageLabel(lang)}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t.email.globalGroup} className="text-slate-900">
                {EMAIL_RECIPIENT_LANGUAGES.filter((lang) => lang.region === "global").map((lang) => (
                  <option key={lang.id} value={lang.id} className="text-slate-900">
                    {lang.flag} {recipientLanguageLabel(lang)}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <button
            type="button"
            onClick={handleCopy}
            disabled={isGenerating}
            className="inline-flex min-h-10 items-center gap-2 self-end rounded-xl border border-white/15 bg-white/5 px-3.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-60"
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
            className="inline-flex min-h-10 items-center gap-2 self-end rounded-xl bg-brand-600 px-3.5 text-sm font-semibold text-white hover:bg-brand-500"
          >
            <Send className="h-4 w-4" />
            {t.email.send}
          </a>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-200 bg-brand-50/50 py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            <p className="mt-3 text-sm font-medium text-brand-800">{t.email.generating}</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </section>
  );
}
