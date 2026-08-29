"use client";

import { useState } from "react";
import { FileSearch } from "lucide-react";
import { getTranslations } from "@/lib/translations";
import type { AuditResult } from "@/lib/types";
import { DashboardHeader } from "@/components/DashboardHeader";
import { HeroSection } from "@/components/HeroSection";
import { ValueProposition } from "@/components/ValueProposition";
import { FileUploadZone } from "@/components/FileUploadZone";
import { AuditReport } from "@/components/AuditReport";
import { PricingSection } from "@/components/PricingSection";
import { SiteFooter } from "@/components/SiteFooter";

export default function DashboardPage() {
  const t = getTranslations("en");
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleAudit = async (file: File | null, useMock: boolean) => {
    setIsLoading(true);
    setApiError(null);

    try {
      let response: Response;

      if (useMock) {
        response = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ useMock: true }),
        });
      } else if (file) {
        const formData = new FormData();
        formData.append("file", file);
        response = await fetch("/api/audit", {
          method: "POST",
          body: formData,
        });
      } else {
        setApiError(t.errors.noFile);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMap: Record<string, string> = {
          NO_FILE: t.errors.noFile,
          INVALID_FILE_TYPE: t.errors.invalidFileType,
          FILE_TOO_LARGE: t.errors.fileTooLarge,
          OPENAI_AUDIT_FAILED: t.errors.openaiFailed,
          OPENAI_API_KEY_MISSING: t.errors.openaiKeyMissing,
        };
        setApiError(errorMap[data.error] ?? t.errors.auditFailed);
        return;
      }

      setAuditResult(data as AuditResult);
    } catch {
      setApiError(t.errors.auditFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader t={t} />
      <HeroSection t={t} />
      <ValueProposition t={t} />

      <main id="product" className="scroll-mt-20 border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div id="audit" className="scroll-mt-24">
            <FileUploadZone t={t} isLoading={isLoading} onAudit={handleAudit} />
          </div>

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

          {!isLoading && auditResult && (
            <div className="mt-8">
              <AuditReport result={auditResult} t={t} />
            </div>
          )}

          {!isLoading && !auditResult && (
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
