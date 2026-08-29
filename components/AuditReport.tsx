import type { AuditResult } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { DocumentDetailsCard } from "@/components/DocumentDetailsCard";
import { ComplianceChecklistTable } from "@/components/ComplianceChecklistTable";
import { DiscrepanciesSummary } from "@/components/DiscrepanciesSummary";
import { FollowUpEmailTemplate } from "@/components/FollowUpEmailTemplate";
import { ClipboardList } from "lucide-react";

interface AuditReportProps {
  result: AuditResult;
  t: Translations;
}

export function AuditReport({ result, t }: AuditReportProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <ClipboardList className="h-4 w-4" />
        <span>
          {t.audit.completed} ·{" "}
          {new Date(result.analyzedAt).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
          {result.sourceFile && (
            <>
              {" "}
              · <span className="font-medium text-slate-800">{result.sourceFile}</span>
            </>
          )}
        </span>
      </div>

      <DocumentDetailsCard document={result.document} t={t} />
      <ComplianceChecklistTable checklist={result.checklist} t={t} />
      <DiscrepanciesSummary discrepancies={result.discrepancies} t={t} />
      <FollowUpEmailTemplate email={result.followUpEmail} t={t} />
    </div>
  );
}
