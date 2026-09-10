"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Upload } from "lucide-react";
import { DocumentSlide } from "@/components/crm/DocumentSlide";
import type { DocumentEntity, FollowUpEmail } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { composeFollowUpEmail } from "@/lib/email-templates";
import { patchInboxEntity, subscribeInbox } from "@/lib/inbox-store";
import { startBulkProcessor } from "@/lib/bulk-processor";
import { prepareBulkInbox } from "@/lib/bulk-upload";
import { isEntityReady } from "@/lib/queue-status";
import { cn } from "@/lib/utils";
import { useBetaAuth } from "@/components/PasswordGate";

interface DocumentSlideDeckProps {
  initialQueue: DocumentEntity[];
  t: Translations;
}

type DraftState = Record<
  string,
  { language: string; emails: Record<string, FollowUpEmail> }
>;

export function DocumentSlideDeck({ initialQueue, t }: DocumentSlideDeckProps) {
  const betaAuth = useBetaAuth();
  const [documents, setDocuments] = useState<DocumentEntity[]>(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [drafts, setDrafts] = useState<DraftState>(() => buildDrafts(initialQueue));
  const submittingRef = useRef(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startBulkProcessor();
    return subscribeInbox((next) => {
      setDocuments(next);
      setDrafts((prev) => mergeDrafts(prev, next));
      setCurrentIndex((index) => Math.min(index, Math.max(0, next.length - 1)));
    });
  }, []);

  const entity = documents[currentIndex];
  const draft = entity ? drafts[entity.id] : undefined;
  const language = draft?.language ?? "en";
  const email = entity
    ? draft?.emails[language] ?? entity.audit?.followUpEmail ?? { subject: "", body: "" }
    : { subject: "", body: "" };

  const setEmail = useCallback(
    (next: FollowUpEmail) => {
      if (!entity) return;
      setDrafts((prev) => ({
        ...prev,
        [entity.id]: {
          language,
          emails: { ...(prev[entity.id]?.emails ?? {}), [language]: next },
        },
      }));
    },
    [entity, language],
  );

  const setLanguage = useCallback(
    (languageId: string) => {
      if (!entity?.audit) return;
      setDrafts((prev) => {
        const current = prev[entity.id] ?? { language: "en", emails: {} };
        const existing = current.emails[languageId];
        const nextEmail =
          existing ??
          composeFollowUpEmail(
            languageId,
            entity.audit!.document,
            entity.audit!.discrepancies.length
              ? entity.audit!.discrepancies
              : ["No blocking discrepancies. Confirm the file is complete on your side."],
          );
        return {
          ...prev,
          [entity.id]: {
            language: languageId,
            emails: { ...current.emails, [languageId]: nextEmail },
          },
        };
      });
    },
    [entity],
  );

  const approveAndNext = useCallback(async () => {
    if (!entity || submittingRef.current || complete) return;
    if (isEntityReady(entity)) {
      submittingRef.current = true;
      setIsSubmitting(true);
      setError(null);
      try {
        const sendResponse = await fetch("/api/audit/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityId: entity.id,
            recipientEmail: entity.recipientEmail,
            recipientName: entity.recipientName,
            language,
            subject: email.subject,
            body: email.body,
          }),
        });
        if (!sendResponse.ok) throw new Error("SEND_FAILED");

        const statusResponse = await fetch("/api/audit/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityId: entity.id,
            status: "approved",
            language,
            shipmentReference: entity.audit?.document.shipmentReference ?? entity.fileName,
          }),
        });
        if (!statusResponse.ok) throw new Error("STATUS_FAILED");
        patchInboxEntity(entity.id, { reviewStatus: "approved" });
      } catch {
        setError(t.crm.approveFailed);
        submittingRef.current = false;
        setIsSubmitting(false);
        return;
      }
      submittingRef.current = false;
      setIsSubmitting(false);
    }

    if (currentIndex < documents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setComplete(true);
    }
  }, [complete, currentIndex, documents.length, email.body, email.subject, entity, language, t.crm.approveFailed]);

  const onHeaderUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setIsUploading(true);
    try {
      await prepareBulkInbox(Array.from(fileList), { append: documents.length > 0 });
      startBulkProcessor();
    } catch {
      setError(t.errors.auditFailed);
    } finally {
      setIsUploading(false);
      if (uploadRef.current) uploadRef.current.value = "";
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (isEditableTarget(target) && !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      void approveAndNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [approveAndNext]);

  if (!documents.length) {
    return (
      <div className="flex h-[100vh] items-center justify-center bg-white">
        <p className="text-sm text-neutral-600">{t.crm.emptyQueue}</p>
      </div>
    );
  }

  const counter = t.crm.progress
    .replace("{current}", String(currentIndex + 1))
    .replace("{total}", String(documents.length));

  return (
    <div className="relative flex h-[100vh] max-h-[100vh] flex-col overflow-hidden bg-white text-neutral-950">
      <header className="flex h-12 max-h-12 shrink-0 items-center gap-3 border-b border-neutral-800 bg-neutral-950 px-4 text-white">
        <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight">
          {t.app.name}
        </Link>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-medium text-neutral-200">
          {counter}
        </p>
        <input
          ref={uploadRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(event) => void onHeaderUpload(event.target.files)}
        />
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          disabled={isUploading}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-neutral-600 px-3 text-xs font-semibold text-white hover:bg-white/10"
        >
          {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {t.crm.uploadMore}
        </button>
        {betaAuth && (
          <button
            type="button"
            onClick={betaAuth.logout}
            className="shrink-0 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-200"
          >
            Logout
          </button>
        )}
      </header>

      <div
        className="relative overflow-hidden"
        style={{ height: "calc(100vh - 48px - 60px)" }}
      >
        <div
          className="flex h-full transition-transform duration-400 ease-out"
          style={{
            width: `${documents.length * 100}%`,
            transform: `translateX(-${(currentIndex / documents.length) * 100}%)`,
          }}
        >
          {documents.map((item, itemIndex) => (
            <div
              key={item.id}
              className="h-full shrink-0 overflow-hidden"
              style={{ width: `${100 / documents.length}%` }}
            >
              {Math.abs(itemIndex - currentIndex) <= 1 ? (
                <DocumentSlide
                  entity={item}
                  t={t}
                  language={item.id === entity?.id ? language : drafts[item.id]?.language ?? "en"}
                  onLanguageChange={item.id === entity?.id ? setLanguage : () => undefined}
                  email={
                    item.id === entity?.id
                      ? email
                      : drafts[item.id]?.emails[drafts[item.id]?.language ?? "en"] ??
                        item.audit?.followUpEmail ?? { subject: "", body: "" }
                  }
                  onEmailChange={item.id === entity?.id ? setEmail : () => undefined}
                />
              ) : (
                <div className="h-full bg-neutral-100" />
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="flex h-[60px] max-h-[60px] shrink-0 items-center justify-end gap-3 border-t border-neutral-200 bg-white px-4">
        {error && (
          <p className="mr-auto truncate text-xs font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => void approveAndNext()}
          disabled={isSubmitting || complete || !isEntityReady(entity)}
          className={cn(
            "inline-flex h-10 items-center rounded-md bg-neutral-950 px-5 text-sm font-semibold text-white",
            isSubmitting || complete ? "opacity-50" : "hover:bg-neutral-800",
          )}
        >
          {isSubmitting ? t.crm.sending : t.crm.approveSendNext}
        </button>
      </footer>

      {complete && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">{t.crm.queueCompleteTitle}</h2>
            <p className="mt-2 text-sm text-neutral-600">{t.crm.queueCompleteBody}</p>
            <Link
              href="/"
              className="mt-6 inline-flex h-10 items-center rounded-md bg-neutral-950 px-5 text-sm font-semibold text-white"
            >
              {t.crm.backHome}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function buildDrafts(queue: DocumentEntity[]): DraftState {
  return Object.fromEntries(
    queue
      .filter((entity) => entity.audit)
      .map((entity) => [
        entity.id,
        { language: "en", emails: { en: entity.audit!.followUpEmail } },
      ]),
  );
}

function mergeDrafts(prev: DraftState, queue: DocumentEntity[]): DraftState {
  const next = { ...prev };
  for (const entity of queue) {
    if (entity.audit && !next[entity.id]) {
      next[entity.id] = { language: "en", emails: { en: entity.audit.followUpEmail } };
    }
  }
  return next;
}

function isEditableTarget(target: HTMLElement | null): boolean {
  if (!target) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}
