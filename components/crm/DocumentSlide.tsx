"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DocumentViewer } from "@/components/crm/DocumentViewer";
import { SlideAuditPanel } from "@/components/crm/SlideAuditPanel";
import { SlideEmailDraft } from "@/components/crm/SlideEmailDraft";
import type { DocumentEntity, FollowUpEmail } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { retryEntity } from "@/lib/bulk-processor";
import { cn } from "@/lib/utils";

interface DocumentSlideProps {
  entity: DocumentEntity;
  t: Translations;
  language: string;
  onLanguageChange: (languageId: string) => void;
  email: FollowUpEmail;
  onEmailChange: (email: FollowUpEmail) => void;
}

type SideTab = "audit" | "email";

export function DocumentSlide({
  entity,
  t,
  language,
  onLanguageChange,
  email,
  onEmailChange,
}: DocumentSlideProps) {
  const [tab, setTab] = useState<SideTab>("audit");
  useEffect(() => {
    setTab("audit");
  }, [entity.id]);
  const ready = entity.processingStatus === "ready" && entity.audit;
  const failed = entity.processingStatus === "failed";

  return (
    <article className="grid h-full min-h-0 w-full grid-cols-[minmax(0,1fr)_minmax(340px,420px)] overflow-hidden">
      <DocumentViewer entity={entity} />
      <aside className="flex h-full min-h-0 flex-col overflow-hidden border-l border-slate-200 bg-white">
        {ready && entity.audit ? (
          <>
            <div className="flex h-10 shrink-0 border-b border-slate-200 px-2">
              <TabButton active={tab === "audit"} onClick={() => setTab("audit")}>
                {t.crm.tabAudit}
              </TabButton>
              <TabButton active={tab === "email"} onClick={() => setTab("email")}>
                {t.crm.tabEmail}
              </TabButton>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {tab === "audit" ? (
                <SlideAuditPanel entity={entity} t={t} />
              ) : (
                <SlideEmailDraft
                  entity={entity}
                  t={t}
                  language={language}
                  onLanguageChange={onLanguageChange}
                  email={email}
                  onEmailChange={onEmailChange}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 pb-20 text-center">
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
      </aside>
    </article>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex-1 px-2 text-sm font-semibold transition-colors",
        active ? "text-slate-900" : "text-slate-400 hover:text-slate-700",
      )}
    >
      {children}
      {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-600" />}
    </button>
  );
}
