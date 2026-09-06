"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import { DocumentSlide } from "@/components/crm/DocumentSlide";
import type { DocumentEntity, FollowUpEmail } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { composeFollowUpEmail } from "@/lib/email-templates";
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
  const [index, setIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [drafts, setDrafts] = useState<DraftState>(() => buildDrafts(initialQueue));
  const submittingRef = useRef(false);

  const entity = queue[index];
  const draft = entity ? drafts[entity.id] : undefined;
  const language = draft?.language ?? "en";
  const email = entity
    ? draft?.emails[language] ?? entity.audit.followUpEmail
    : { subject: "", body: "" };

  const progressLabel = useMemo(() => {
    if (!entity) return "";
    return t.crm.progress
      .replace("{current}", String(index + 1))
      .replace("{total}", String(queue.length));
  }, [entity, index, queue.length, t.crm.progress]);

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
      if (!entity) return;
      setDrafts((prev) => {
        const current = prev[entity.id] ?? { language: "en", emails: {} };
        const existing = current.emails[languageId];
        const nextEmail =
          existing ??
          composeFollowUpEmail(
            languageId,
            entity.audit.document,
            entity.audit.discrepancies.length
              ? entity.audit.discrepancies
              : [
                  "No blocking discrepancies. Confirm the file is complete on your side.",
                ],
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
          shipmentReference: entity.audit.document.shipmentReference,
        }),
      });

      if (!statusResponse.ok) {
        throw new Error("STATUS_FAILED");
      }

      setQueue((prev) =>
        prev.map((item, itemIndex) =>
          itemIndex === index ? { ...item, reviewStatus: "approved" } : item,
        ),
      );

      if (index >= queue.length - 1) {
        setComplete(true);
      } else {
        setIndex((current) => current + 1);
      }
    } catch {
      setError(t.crm.approveFailed);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [complete, email.body, email.subject, entity, index, language, queue.length, t.crm.approveFailed]);

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

  if (!entity) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">{t.crm.emptyQueue}</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-slate-100">
      <header className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-white">{t.app.name}</span>
        </Link>
        <p className="text-xs font-medium text-slate-300">{progressLabel}</p>
        <p className="hidden text-xs text-slate-500 sm:block">{t.crm.enterHint}</p>
      </header>

      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        onWheel={(event) => {
          event.stopPropagation();
        }}
      >
        {queue.map((item, itemIndex) => {
          const isActive = item.id === entity.id;
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
                        item.audit.followUpEmail
                  }
                  onEmailChange={isActive ? setEmail : () => undefined}
                />
              ) : (
                <div className="h-full bg-slate-200" />
              )}
            </div>
          );
        })}
      </div>

      <footer className="z-20 flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {entity.audit.document.shipmentReference}
          </p>
          <p className="truncate text-xs text-slate-500">
            {entity.recipientName} · {entity.recipientEmail}
          </p>
          {error && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void approveAndNext()}
          disabled={isSubmitting || complete}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm",
            isSubmitting || complete ? "bg-brand-400" : "bg-brand-600 hover:bg-brand-500",
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.crm.sending}
            </>
          ) : (
            <>
              {t.crm.approveNext}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </footer>

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
    queue.map((entity) => [
      entity.id,
      {
        language: "en",
        emails: { en: entity.audit.followUpEmail },
      },
    ]),
  );
}

function isEditableTarget(target: HTMLElement | null): boolean {
  if (!target) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}
