"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileSearch } from "lucide-react";
import { getTranslations } from "@/lib/translations";
import { DashboardHeader } from "@/components/DashboardHeader";
import { HeroSection } from "@/components/HeroSection";
import { ValueProposition } from "@/components/ValueProposition";
import { FileUploadZone } from "@/components/FileUploadZone";
import { DocumentSwitcher, type SwitcherItem, type SwitcherStatus } from "@/components/DocumentSwitcher";
import { AuditReport } from "@/components/AuditReport";
import { PricingSection } from "@/components/PricingSection";
import { SiteFooter } from "@/components/SiteFooter";
import { cloneSampleQueue } from "@/lib/document-entities";
import { setInboxQueue, subscribeInbox } from "@/lib/inbox-store";
import { MAX_UPLOAD_FILES, mergeUploadedFiles, prepareBulkInbox } from "@/lib/bulk-upload";
import { startBulkProcessor } from "@/lib/bulk-processor";
import { queueVisualStatus } from "@/lib/queue-status";
import type { DocumentEntity } from "@/lib/types";

export default function DashboardPage() {
  const t = getTranslations("en");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedAudit, setHasStartedAudit] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasStartedAudit) return;
    return subscribeInbox((next) => {
      setDocuments(next);
      setActiveIndex((index) => Math.min(index, Math.max(0, next.length - 1)));
    });
  }, [hasStartedAudit]);

  const itemCount = Math.max(uploadedFiles.length, documents.length);

  useEffect(() => {
    setActiveIndex((index) => (itemCount === 0 ? 0 : Math.min(index, itemCount - 1)));
  }, [itemCount]);

  const addUploadedFiles = useCallback(
    (incoming: FileList | File[]) => {
      const result = mergeUploadedFiles(uploadedFiles, Array.from(incoming), {
        maxFiles: MAX_UPLOAD_FILES,
        currentCount: Math.max(uploadedFiles.length, documents.length),
      });
      setUploadedFiles(result.files);
      setApiError(result.error ? t.errors[result.error] : null);

      if (hasStartedAudit && result.added.length) {
        void prepareBulkInbox(result.added, { append: documents.length > 0 })
          .then(() => startBulkProcessor())
          .catch(() => setApiError(t.errors.auditFailed));
      }
    },
    [documents.length, hasStartedAudit, t.errors, uploadedFiles],
  );

  const handleAudit = async (files: File[], useMock: boolean) => {
    setIsLoading(true);
    setApiError(null);

    try {
      if (useMock) {
        const queue = cloneSampleQueue();
        setInboxQueue(queue);
        setUploadedFiles([]);
        setDocuments(queue);
        setActiveIndex(0);
        setHasStartedAudit(true);
        return;
      }

      if (!files.length) {
        setApiError(t.errors.noFile);
        return;
      }

      const entities = await prepareBulkInbox(files);
      if (!entities.length) {
        setApiError(t.errors.noFile);
        return;
      }

      startBulkProcessor();
      setDocuments(entities);
      setActiveIndex(0);
      setHasStartedAudit(true);
    } catch {
      setApiError(t.errors.auditFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const switcherItems = useMemo<SwitcherItem[]>(() => {
    if (hasStartedAudit && documents.length) {
      return documents.map((entity) => ({
        id: entity.id,
        name: entity.originFileName ?? entity.fileName,
        status: statusForEntity(entity),
        categoryLabel: entity.audit
          ? t.documentCategory[entity.audit.document.documentCategory]
          : undefined,
      }));
    }

    return uploadedFiles.map((file, index) => ({
      id: `file-${file.name}-${file.size}-${index}`,
      name: file.name,
      status: "selected" as const,
    }));
  }, [documents, hasStartedAudit, t.documentCategory, uploadedFiles]);

  const activeEntity = hasStartedAudit ? documents[activeIndex] : undefined;
  const showSwitcher = switcherItems.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader t={t} />
      <HeroSection t={t} />
      <ValueProposition t={t} />

      <main id="product" className="scroll-mt-20 border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div id="audit" className="scroll-mt-24">
            <FileUploadZone
              t={t}
              isLoading={isLoading}
              uploadedFiles={uploadedFiles}
              onFilesChange={setUploadedFiles}
              onAddFiles={addUploadedFiles}
              onAudit={handleAudit}
              canRemoveFiles={!hasStartedAudit && !isLoading}
              onFileError={setApiError}
            />
          </div>

          {showSwitcher && (
            <DocumentSwitcher
              t={t}
              items={switcherItems}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              onAddFiles={addUploadedFiles}
              canAddMore={itemCount < MAX_UPLOAD_FILES}
            />
          )}

          {apiError && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {apiError}
            </p>
          )}

          {isLoading && (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 shadow-card">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <p className="mt-4 text-sm font-medium text-brand-700">{t.upload.auditing}</p>
              <p className="mt-1 text-xs text-brand-500">{t.upload.auditingDetail}</p>
            </div>
          )}

          {!isLoading && activeEntity?.processingStatus === "failed" && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center shadow-card">
              <h3 className="text-base font-semibold text-red-800">{t.crm.analyzeFailed}</h3>
              {activeEntity.errorMessage && (
                <p className="mt-2 text-sm text-red-700">{activeEntity.errorMessage}</p>
              )}
            </div>
          )}

          {!isLoading &&
            activeEntity &&
            (activeEntity.processingStatus === "queued" || activeEntity.processingStatus === "processing") && (
              <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 shadow-card">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
                <p className="mt-4 text-sm font-medium text-brand-700">{t.crm.waitingFirst}</p>
                <p className="mt-1 text-xs text-brand-500">
                  {t.crm.processingProgress
                    .replace(
                      "{current}",
                      String(documents.filter((item) => item.processingStatus === "ready" || item.processingStatus === "failed").length),
                    )
                    .replace("{total}", String(documents.length))}
                </p>
              </div>
            )}

          {!isLoading && activeEntity?.audit && <div className="mt-8"><AuditReport result={activeEntity.audit} t={t} /></div>}

          {!isLoading &&
            !activeEntity?.audit &&
            activeEntity?.processingStatus !== "failed" &&
            activeEntity?.processingStatus !== "queued" &&
            activeEntity?.processingStatus !== "processing" && (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FileSearch className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-800">{t.empty.title}</h3>
              <p className="mt-1 max-w-md text-sm text-slate-500">{t.empty.description}</p>
            </div>
          )}
        </div>
      </main>

      <PricingSection t={t} />
      <SiteFooter t={t} />
    </div>
  );
}

function statusForEntity(entity: DocumentEntity): SwitcherStatus {
  if (entity.processingStatus === "failed") return "failed";
  if (entity.processingStatus !== "ready" || !entity.audit) return "processing";
  return queueVisualStatus(entity) === "ok" ? "ok" : "discrepancy";
}
