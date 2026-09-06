"use client";

import { AlertTriangle, Check, FileText, Loader2, X } from "lucide-react";
import type { DocumentEntity } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { queueVisualStatus } from "@/lib/queue-status";
import { cn } from "@/lib/utils";

interface QueueThumbnailBarProps {
  queue: DocumentEntity[];
  activeId: string | undefined;
  t: Translations;
  onSelect: (id: string) => void;
}

export function QueueThumbnailBar({ queue, activeId, t, onSelect }: QueueThumbnailBarProps) {
  const done = queue.filter(
    (entity) =>
      entity.processingStatus === "ready" ||
      entity.processingStatus === "failed" ||
      entity.reviewStatus === "approved",
  ).length;
  const total = queue.length;
  const stillWorking = queue.some(
    (entity) => entity.processingStatus === "queued" || entity.processingStatus === "processing",
  );
  const label = stillWorking
    ? t.crm.processingProgress.replace("{current}", String(done)).replace("{total}", String(total))
    : t.crm.progress.replace("{current}", String(Math.min(done, total))).replace("{total}", String(total));

  return (
    <div className="border-b border-slate-800 bg-slate-900 px-3 py-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-200">{label}</p>
        <div className="h-1.5 min-w-[120px] flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-300"
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {queue.map((entity, index) => {
          const visual = queueVisualStatus(entity);
          const selectable = entity.processingStatus === "ready";
          return (
            <button
              key={entity.id}
              type="button"
              onClick={() => {
                if (selectable) onSelect(entity.id);
              }}
              disabled={!selectable}
              className={cn(
                "group relative w-[76px] shrink-0 overflow-hidden rounded-lg border text-left",
                entity.id === activeId
                  ? "border-brand-400 ring-2 ring-brand-500/60"
                  : "border-white/10",
                selectable ? "cursor-pointer hover:border-white/30" : "cursor-default opacity-80",
              )}
            >
              <div className="flex h-14 items-center justify-center bg-slate-800">
                {entity.thumbnailUrl ? (
                  <img src={entity.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <p className="truncate bg-slate-950 px-1 py-0.5 text-[9px] font-medium text-slate-300">
                {index + 1}
                {entity.pageCount && entity.pageCount > 1 ? ` · p${entity.pageIndex}` : ""}
              </p>
              <StatusPip visual={visual} t={t} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatusPip({
  visual,
  t,
}: {
  visual: ReturnType<typeof queueVisualStatus>;
  t: Translations;
}) {
  const map = {
    processing: {
      className: "bg-sky-500 text-white",
      icon: Loader2,
      spin: true,
      label: t.crm.statusProcessing,
    },
    ok: {
      className: "bg-emerald-500 text-white",
      icon: Check,
      spin: false,
      label: t.crm.statusOk,
    },
    discrepancy: {
      className: "bg-amber-500 text-slate-950",
      icon: AlertTriangle,
      spin: false,
      label: t.crm.statusDiscrepancy,
    },
    failed: {
      className: "bg-red-600 text-white",
      icon: X,
      spin: false,
      label: t.crm.statusFailed,
    },
    approved: {
      className: "bg-emerald-700 text-white",
      icon: Check,
      spin: false,
      label: t.crm.statusOk,
    },
  } as const;
  const item = map[visual];
  const Icon = item.icon;
  return (
    <span
      title={item.label}
      className={cn(
        "absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full shadow",
        item.className,
      )}
    >
      <Icon className={cn("h-3 w-3", item.spin && "animate-spin")} />
    </span>
  );
}
