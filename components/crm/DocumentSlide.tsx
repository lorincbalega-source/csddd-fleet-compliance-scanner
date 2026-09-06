"use client";

import { Loader2 } from "lucide-react";
import { DocumentViewer } from "@/components/crm/DocumentViewer";
import { SlideAuditPanel } from "@/components/crm/SlideAuditPanel";
import { SlideEmailDraft } from "@/components/crm/SlideEmailDraft";
import type { DocumentEntity, FollowUpEmail } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { retryEntity } from "@/lib/bulk-processor";

interface DocumentSlideProps {
  entity: DocumentEntity;
  t: Translations;
  language: string;
  onLanguageChange: (languageId: string) => void;
  email: FollowUpEmail;
  onEmailChange: (email: FollowUpEmail) => void;
}

export function DocumentSlide({
  entity,
  t,
  language,
  onLanguageChange,
  email,
  onEmailChange,
}: DocumentSlideProps) {
  const ready = entity.processingStatus === "ready" && entity.audit;
  const failed = entity.processingStatus === "failed";

  return (
    <article className="grid h-full min-h-0 w-full shrink-0 grid-rows-[minmax(38vh,42%)_minmax(0,1fr)] lg:grid-rows-none lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <DocumentViewer entity={entity} />
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50">
        {ready && entity.audit ? (
          <>
            <SlideAuditPanel entity={entity} t={t} />
            <SlideEmailDraft
              entity={entity}
              t={t}
              language={language}
              onLanguageChange={onLanguageChange}
              email={email}
              onEmailChange={onEmailChange}
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            {failed ? (
              <>
                <p className="text-sm font-semibold text-slate-800">{t.crm.analyzeFailed}</p>
                <p className="text-xs text-slate-500">{entity.errorMessage ?? t.errors.auditFailed}</p>
                <button
                  type="button"
                  onClick={() => retryEntity(entity.id)}
                  className="mt-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
                >
                  {t.crm.retryAnalyze}
                </button>
              </>
            ) : (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                <p className="text-sm font-semibold text-slate-800">{t.crm.waitingFirst}</p>
                <p className="text-xs text-slate-500">{entity.fileName}</p>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
