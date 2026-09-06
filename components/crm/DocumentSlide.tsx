"use client";

import { DocumentViewer } from "@/components/crm/DocumentViewer";
import { SlideAuditPanel } from "@/components/crm/SlideAuditPanel";
import { SlideEmailDraft } from "@/components/crm/SlideEmailDraft";
import type { DocumentEntity, FollowUpEmail } from "@/lib/types";
import type { Translations } from "@/lib/translations";

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
  return (
    <article className="grid h-full min-h-0 w-full shrink-0 grid-rows-[minmax(38vh,42%)_minmax(0,1fr)] lg:grid-rows-none lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <DocumentViewer entity={entity} />
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50">
        <SlideAuditPanel entity={entity} t={t} />
        <SlideEmailDraft
          entity={entity}
          t={t}
          language={language}
          onLanguageChange={onLanguageChange}
          email={email}
          onEmailChange={onEmailChange}
        />
      </div>
    </article>
  );
}
