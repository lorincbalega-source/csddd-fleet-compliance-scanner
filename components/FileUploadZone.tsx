"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  FileText,
  X,
  Loader2,
  Sparkles,
  FlaskConical,
  Camera,
} from "lucide-react";
import type { Translations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { isAcceptedUpload } from "@/lib/bulk-upload";

interface FileUploadZoneProps {
  t: Translations;
  isLoading: boolean;
  onAudit: (files: File[], useMock: boolean) => void;
}

export function FileUploadZone({ t, isLoading, onAudit }: FileUploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const next = Array.from(incoming);
      const valid: File[] = [];
      let rejected = false;
      for (const file of next) {
        if (isAcceptedUpload(file)) {
          valid.push(file);
        } else {
          rejected = true;
        }
      }
      if (rejected && valid.length === 0) {
        setError(t.errors.invalidFileType);
        return;
      }
      setError(rejected ? t.errors.invalidFileType : null);
      setSelectedFiles((prev) => {
        const names = new Set(prev.map((file) => `${file.name}:${file.size}`));
        const merged = [...prev];
        for (const file of valid) {
          const key = `${file.name}:${file.size}`;
          if (!names.has(key)) {
            names.add(key);
            merged.push(file);
          }
        }
        return merged;
      });
    },
    [t],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleRunAudit = () => {
    if (!selectedFiles.length) {
      setError(t.errors.noFile);
      return;
    }
    onAudit(selectedFiles, false);
  };

  const handleLoadSample = () => {
    setSelectedFiles([]);
    setError(null);
    onAudit([], true);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <div className="border-b border-slate-100 bg-slate-950 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-400">
          {t.upload.kicker}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">{t.upload.title}</h2>
        <p className="mt-1 text-sm text-slate-400">{t.app.subtitle}</p>
      </div>

      <div className="p-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-colors",
            isDragging
              ? "border-brand-500 bg-brand-50"
              : "border-slate-200 bg-slate-50/80 hover:border-brand-400 hover:bg-brand-50/40",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-brand-400 shadow-sm">
            <Upload className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-800">
            {isDragging ? t.upload.dropHere : t.upload.description}
          </p>
          <p className="mt-1 text-xs text-slate-400">{t.upload.acceptedFormats}</p>
          <div className="mt-4 flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="min-h-11 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-800 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
            >
              {t.upload.browse}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cameraRef.current?.click();
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
            >
              <Camera className="h-4 w-4" />
              {t.upload.takePhoto}
            </button>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t.upload.selectedCount.replace("{count}", String(selectedFiles.length))}
            </p>
            <ul className="max-h-48 space-y-2 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <li
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-slate-200">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
                      setError(null);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    aria-label={t.upload.removeFile}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={isLoading}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition-all",
              isLoading
                ? "cursor-not-allowed bg-brand-400"
                : "bg-brand-600 hover:bg-brand-700 active:scale-[0.98]",
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.upload.auditing}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {t.upload.runAudit}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLoadSample}
            disabled={isLoading}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FlaskConical className="h-4 w-4 text-slate-500" />
            {t.upload.loadSample}
          </button>
        </div>
      </div>
    </section>
  );
}
