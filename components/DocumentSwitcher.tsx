"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Translations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { MAX_UPLOAD_FILES, UPLOAD_ACCEPT } from "@/lib/bulk-upload";

export type SwitcherStatus = "selected" | "processing" | "ok" | "discrepancy" | "failed";

export interface SwitcherItem {
  id: string;
  name: string;
  status: SwitcherStatus;
  categoryLabel?: string;
}

interface DocumentSwitcherProps {
  t: Translations;
  items: SwitcherItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAddFiles: (files: FileList) => void;
  canAddMore: boolean;
}

const statusStyles: Record<SwitcherStatus, string> = {
  selected: "bg-slate-100 text-slate-600",
  processing: "bg-sky-50 text-sky-700",
  ok: "bg-emerald-50 text-emerald-700",
  discrepancy: "bg-amber-50 text-amber-800",
  failed: "bg-red-50 text-red-700",
};

export function DocumentSwitcher({
  t,
  items,
  activeIndex,
  onSelect,
  onAddFiles,
  canAddMore,
}: DocumentSwitcherProps) {
  const addMoreRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIndex]);

  const statusLabel = (status: SwitcherStatus) => {
    if (status === "selected") return t.upload.statusSelected;
    if (status === "processing") return t.crm.statusProcessing;
    if (status === "ok") return t.crm.statusOk;
    if (status === "discrepancy") return t.crm.statusDiscrepancy;
    return t.crm.statusFailed;
  };

  return (
    <div className="sticky top-16 z-30 mt-6 rounded-2xl border border-slate-200/80 bg-white/95 shadow-card backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t.upload.documents}
          </p>
          <p className="text-sm font-medium text-slate-800">
            {t.upload.fileCount
              .replace("{count}", String(items.length))
              .replace("{max}", String(MAX_UPLOAD_FILES))}
          </p>
        </div>
        <div>
          <input
            ref={addMoreRef}
            type="file"
            accept={UPLOAD_ACCEPT}
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.length) onAddFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => addMoreRef.current?.click()}
            disabled={!canAddMore}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {t.upload.addMoreFiles}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-3">
        <button
          type="button"
          onClick={() => onSelect(Math.max(0, activeIndex - 1))}
          disabled={activeIndex <= 0}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t.upload.prevDocument}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {items.map((item, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={item.id}
                ref={active ? activeRef : undefined}
                type="button"
                onClick={() => onSelect(index)}
                className={cn(
                  "min-w-[11rem] max-w-[16rem] shrink-0 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/30"
                    : "border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-white",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  {item.categoryLabel ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {item.categoryLabel}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {index + 1}
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      statusStyles[item.status],
                    )}
                  >
                    {statusLabel(item.status)}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-medium text-slate-900" title={item.name}>
                  {item.name}
                </p>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onSelect(Math.min(items.length - 1, activeIndex + 1))}
          disabled={activeIndex >= items.length - 1}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t.upload.nextDocument}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
