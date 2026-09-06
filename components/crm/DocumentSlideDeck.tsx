"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import { DocumentSlide } from "@/components/crm/DocumentSlide";
import type { DocumentEntity, FollowUpEmail } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { composeFollowUpEmail } from "@/lib/email-templates";
import { patchInboxEntity, subscribeInbox } from "@/lib/inbox-store";
import { startBulkProcessor } from "@/lib/bulk-processor";
import { isEntityReady } from "@/lib/queue-status";
import { cn } from "@/lib/utils";

interface DocumentSlideDeckProps {
  initialQueue: DocumentEntity[];
  t: Translations;
}

type DraftState = Record<
  string,
  { language: string; emails: Record<string, FollowUpEmail> }
>;

export function DocumentSlideDeck({ initialQueue, t }: DocumentSlideDeckProps) {
  const [queue, setQueue] = useState(initialQueue);
  const [index, setIndex] = useState(() => firstReadyIndex(initialQueue));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [drafts, setDrafts] = useState<DraftState>(() => buildDrafts(initialQueue));
  const submittingRef = useRef(false);
  const [waitingForNext, setWaitingForNext] = useState(false);

  useEffect(() => {
    startBulkProcessor();
    return subscribeInbox((next) => {
      setQueue(next);
      setDrafts((prev) => mergeDrafts(prev, next));
    });
  }, []);

  const entity = queue[index];
  const draft = entity ? drafts[entity.id] : undefined;
  const language = draft?.language ?? "en";
  const email = entity
    ? draft?.emails[language] ?? entity.audit?.followUpEmail ?? { subject: "", body: "" }
    : { subject: "", body: "" };

  useEffect(() => {
    if (complete) return;
    const current = queue[index];
    if (waitingForNext) {
      const nextReady = nextReadyIndex(queue, index);
      if (nextReady !== null && nextReady >= 0) {
        setWaitingForNext(false);
        setIndex(nextReady);
      } else if (nextReady === -1 && !queueHasWork(queue)) {
        setWaitingForNext(false);
        setComplete(true);
      }
      return;
    }
    if (!current || !isEntityReady(current) || current.reviewStatus === "approved") {
      const ready = firstPendingReadyIndex(queue);
      if (ready >= 0 && ready !== index) setIndex(ready);
    }
  }, [queue, index, complete, waitingForNext]);

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
    if (!entity || !isEntityReady(entity) || submittingRef.current || complete) return;
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

      if (!sendResponse.ok) {
        throw new Error("SEND_FAILED");
      }

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

      if (!statusResponse.ok) {
        throw new Error("STATUS_FAILED");
      }

      patchInboxEntity(entity.id, { reviewStatus: "approved" });

      const nextReady = nextReadyIndex(queue, index);
      if (nextReady !== null && nextReady >= 0) {
        setIndex(nextReady);
      } else if (nextReady === null) {
        setWaitingForNext(true);
      } else {
        setComplete(true);
      }
    } catch {
      setError(t.crm.approveFailed);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [complete, email.body, email.subject, entity, index, language, queue, t.crm.approveFailed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat) return;
      const target = event.target as HTMLElement | null;
      const inField = isEditableTarget(target);
      if (inField && !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      void approveAndNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [approveAndNext]);

  const canApprove = Boolean(entity && isEntityReady(entity) && entity.reviewStatus !== "approved" && !complete);

  if (!queue.length) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">{t.crm.emptyQueue}</p>
      </div>
    );
  }

  const done = queue.filter(
    (item) =>
      item.processingStatus === "ready" ||
      item.processingStatus === "failed" ||
      item.reviewStatus === "approved",
  ).length;
  const stillWorking = queue.some(
    (item) => item.processingStatus === "queued" || item.processingStatus === "processing",
  );
  const headerProgress = stillWorking
    ? t.crm.processingProgress.replace("{current}", String(done)).replace("{total}", String(queue.length))
    : t.crm.progress.replace("{current}", String(index + 1)).replace("{total}", String(queue.length));

  return (
    <div className="relative flex h-[100vh] max-h-[100vh] flex-col overflow-hidden bg-slate-100">
      <header className="z-20 flex h-12 shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-950 px-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold text-white">{t.app.name}</span>
        </Link>
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-300">
          {entity?.audit?.document.shipmentReference ?? entity?.fileName ?? ""}
          {entity?.originFileName && entity.originFileName !== entity.fileName
            ? ` · ${entity.originFileName}`
            : ""}
        </p>
        <p className="shrink-0 text-xs font-medium text-slate-400">{headerProgress}</p>
        {error && (
          <p className="hidden max-w-[220px] truncate text-xs text-red-400 lg:block" role="alert">
            {error}
          </p>
        )}
      </header>

      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        onWheel={(event) => {
          event.stopPropagation();
        }}
      >
        {queue.map((item, itemIndex) => {
          const isActive = item.id === entity?.id;
          const nearby = Math.abs(itemIndex - index) <= 1;
          return (
            <div
              key={item.id}
              aria-hidden={!isActive}
              className="absolute inset-0 h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `translateX(${(itemIndex - index) * 100}%)`,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              {nearby ? (
                <DocumentSlide
                  entity={item}
                  t={t}
                  language={isActive ? language : drafts[item.id]?.language ?? "en"}
                  onLanguageChange={isActive ? setLanguage : () => undefined}
                  email={
                    isActive
                      ? email
                      : drafts[item.id]?.emails[drafts[item.id]?.language ?? "en"] ??
                        item.audit?.followUpEmail ?? { subject: "", body: "" }
                  }
                  onEmailChange={isActive ? setEmail : () => undefined}
                />
              ) : (
                <div className="h-full bg-slate-200" />
              )}
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-end p-3">
          <div className="pointer-events-auto flex max-w-[420px] flex-col items-end gap-1">
            {waitingForNext && (
              <p className="rounded-lg bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
                {t.crm.waitingNextReady}
              </p>
            )}
            <button
              type="button"
              onClick={() => void approveAndNext()}
              disabled={!canApprove || isSubmitting}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20",
                !canApprove || isSubmitting ? "bg-brand-400" : "bg-brand-600 hover:bg-brand-500",
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.crm.sending}
                </>
              ) : waitingForNext ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.crm.waitingNextReady}
                </>
              ) : (
                <>
                  {t.crm.approveSendNext}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {complete && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-card-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{t.crm.queueCompleteTitle}</h2>
            <p className="mt-2 text-sm text-slate-500">{t.crm.queueCompleteBody}</p>
            <Link
              href="/"
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-500"
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
        {
          language: "en",
          emails: { en: entity.audit!.followUpEmail },
        },
      ]),
  );
}

function mergeDrafts(prev: DraftState, queue: DocumentEntity[]): DraftState {
  const next = { ...prev };
  for (const entity of queue) {
    if (entity.audit && !next[entity.id]) {
      next[entity.id] = {
        language: "en",
        emails: { en: entity.audit.followUpEmail },
      };
    }
  }
  return next;
}

function firstReadyIndex(queue: DocumentEntity[]): number {
  const ready = queue.findIndex((entity) => isEntityReady(entity) && entity.reviewStatus === "pending");
  return ready >= 0 ? ready : 0;
}

function firstPendingReadyIndex(queue: DocumentEntity[]): number {
  return queue.findIndex((entity) => isEntityReady(entity) && entity.reviewStatus === "pending");
}

/** Next pending item: wait (null) if still analyzing, skip failed, -1 if none left. */
function nextReadyIndex(queue: DocumentEntity[], fromExclusive: number): number | null {
  for (let i = fromExclusive + 1; i < queue.length; i += 1) {
    const item = queue[i];
    if (item.reviewStatus === "approved") continue;
    if (item.processingStatus === "failed") continue;
    if (item.processingStatus === "queued" || item.processingStatus === "processing") return null;
    if (isEntityReady(item)) return i;
  }
  return -1;
}

function queueHasWork(queue: DocumentEntity[]): boolean {
  return queue.some(
    (entity) =>
      entity.reviewStatus !== "approved" &&
      (entity.processingStatus === "queued" ||
        entity.processingStatus === "processing" ||
        (isEntityReady(entity) && entity.reviewStatus === "pending")),
  );
}

function isEditableTarget(target: HTMLElement | null): boolean {
  if (!target) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}
