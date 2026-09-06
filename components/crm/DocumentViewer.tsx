"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DocumentEntity } from "@/lib/types";
import type { Translations } from "@/lib/translations";

interface DocumentViewerProps {
  entity: DocumentEntity;
  t: Translations;
}

export function DocumentViewer({ entity, t }: DocumentViewerProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const pages = entity.pages.length ? entity.pages : [];

  useEffect(() => {
    setPageIndex(0);
  }, [entity.id]);

  const page = pages[pageIndex];
  const multi = pages.length > 1;

  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-950">
      <div
        className="flex h-full w-full items-center justify-center p-3"
        onWheelCapture={(event) => event.stopPropagation()}
      >
        {page?.kind === "image" && page.src ? (
          <img
            src={page.src}
            alt={page.label}
            className="max-h-full max-w-full object-contain"
          />
        ) : page?.src ? (
          <iframe
            title={`${entity.fileName} ${page.label}`}
            src={page.src}
            className="h-full w-full border-0 bg-white object-contain"
          />
        ) : entity.fileUrl && entity.fileKind === "image" ? (
          <img
            src={entity.fileUrl}
            alt={entity.fileName}
            className="max-h-full max-w-full object-contain"
          />
        ) : entity.fileUrl ? (
          <iframe
            title={entity.fileName}
            src={entity.fileUrl}
            className="h-full w-full border-0 bg-white"
          />
        ) : (
          <p className="text-sm text-neutral-400">{entity.fileName}</p>
        )}
      </div>

      {multi && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
          <button
            type="button"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-950 disabled:opacity-30"
            aria-label={t.crm.pagePrev}
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((value) => Math.max(0, value - 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
            {pageIndex + 1} / {pages.length}
          </span>
          <button
            type="button"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-950 disabled:opacity-30"
            aria-label={t.crm.pageNext}
            disabled={pageIndex >= pages.length - 1}
            onClick={() => setPageIndex((value) => Math.min(pages.length - 1, value + 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
