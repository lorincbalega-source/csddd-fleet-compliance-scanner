"use client";

import { useEffect, useMemo, useState } from "react";
import type { DocumentEntity, FollowUpEmail } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import {
  EMAIL_RECIPIENT_LANGUAGES,
  recipientLanguageLabel,
} from "@/lib/languages";
import { composeFollowUpEmail } from "@/lib/email-templates";

interface SlideEmailDraftProps {
  entity: DocumentEntity;
  t: Translations;
  language: string;
  onLanguageChange: (languageId: string) => void;
  email: FollowUpEmail;
  onEmailChange: (email: FollowUpEmail) => void;
}

export function SlideEmailDraft({
  entity,
  t,
  language,
  onLanguageChange,
  email,
  onEmailChange,
}: SlideEmailDraftProps) {
  const [error, setError] = useState<string | null>(null);

  const europe = useMemo(
    () => EMAIL_RECIPIENT_LANGUAGES.filter((lang) => lang.region === "europe"),
    [],
  );
  const global = useMemo(
    () => EMAIL_RECIPIENT_LANGUAGES.filter((lang) => lang.region === "global"),
    [],
  );

  useEffect(() => {
    setError(null);
  }, [entity.id]);

  const handleLanguageChange = async (languageId: string) => {
    onLanguageChange(languageId);
    setError(null);

    const fallback = composeFollowUpEmail(
      languageId,
      entity.audit?.document ?? {
        carrierName: entity.recipientName,
        shipper: "",
        consignee: "",
        vehiclePlate: "",
        cargoWeight: "",
        signaturePresent: false,
        stampPresent: false,
        documentDate: "",
        documentType: "",
        documentCategory: "unknown",
        shipmentReference: entity.fileName,
        riskLevel: "action_needed",
      },
      entity.audit?.discrepancies.length
        ? entity.audit.discrepancies
        : ["No blocking discrepancies. Confirm the file is complete on your side."],
    );
    onEmailChange(fallback);

    try {
      const response = await fetch("/api/audit/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientLanguage: languageId,
          document: entity.audit?.document,
          discrepancies: entity.audit?.discrepancies ?? [],
          checklist: entity.audit?.checklist ?? [],
          sourceFile: entity.audit?.sourceFile,
        }),
      });

      if (!response.ok) return;

      const data = await response.json();
      const next = {
        subject: String(data.subject ?? "").trim(),
        body: String(data.body ?? "").trim(),
      };
      if (next.subject && next.body) {
        onEmailChange(next);
      }
    } catch {
      // Keep the local 22-language draft when the generator is unavailable.
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-2 pt-3">
        <p className="text-[11px] text-slate-500">{t.crm.emailHint}</p>
        <label className="min-w-[148px]">
          <span className="sr-only">{t.email.recipientLanguage}</span>
          <select
            value={language}
            onChange={(event) => void handleLanguageChange(event.target.value)}
            className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-800 outline-none ring-brand-500 focus:ring-2"
          >
            <optgroup label={t.email.europeGroup}>
              {europe.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.flag} {recipientLanguageLabel(lang)}
                </option>
              ))}
            </optgroup>
            <optgroup label={t.email.globalGroup}>
              {global.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.flag} {recipientLanguageLabel(lang)}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4"
        onWheelCapture={(event) => event.stopPropagation()}
      >
        {error && (
          <p className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
            {error}
          </p>
        )}
        <div className="space-y-3">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t.email.subject}
            </span>
            <input
              value={email.subject}
              onChange={(event) => onEmailChange({ ...email, subject: event.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 outline-none ring-brand-500 focus:ring-2"
            />
          </label>
          <label className="block h-[calc(100%-4rem)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {t.email.body}
            </span>
            <textarea
              value={email.body}
              onChange={(event) => onEmailChange({ ...email, body: event.target.value })}
              className="mt-1 min-h-[280px] w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-sm leading-relaxed text-slate-800 outline-none ring-brand-500 focus:ring-2"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
