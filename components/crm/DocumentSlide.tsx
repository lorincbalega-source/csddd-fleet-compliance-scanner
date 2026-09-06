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
    <article className="flex h-full min-h-0 w-full flex-row overflow-hidden">
      <div className="h-full w-1/2 min-w-0 overflow-hidden border-r border-neutral-800">
        <DocumentViewer entity={entity} t={t} />
      </div>
      <aside className="flex h-full w-1/2 min-w-0 min-h-0 flex-col overflow-hidden bg-white">
        {ready && entity.audit ? (
          <>
            <div className="flex h-10 shrink-0 border-b border-neutral-200">
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
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            {failed ? (
              <>
                <p className="text-sm font-semibold text-neutral-950">{t.crm.analyzeFailed}</p>
                <p className="text-xs text-neutral-500">{entity.errorMessage ?? t.errors.auditFailed}</p>
                <button
                  type="button"
                  onClick={() => retryEntity(entity.id)}
                  className="mt-2 h-10 rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white"
                >
                  {t.crm.retryAnalyze}
                </button>
              </>
            ) : (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-neutral-950" />
                <p className="text-sm font-semibold text-neutral-950">{t.crm.waitingFirst}</p>
                <p className="text-xs text-neutral-500">{entity.fileName}</p>
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
        "relative h-full flex-1 text-sm font-semibold",
        active ? "text-neutral-950" : "text-neutral-400 hover:text-neutral-700",
      )}
    >
      {children}
      {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-neutral-950" />}
    </button>
  );
}
