import type { AuditResult } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { StatusBadge, getCheckStatusLabel } from "@/components/StatusBadge";

interface ComplianceChecklistTableProps {
  checklist: AuditResult["checklist"];
  t: Translations;
}

export function ComplianceChecklistTable({
  checklist,
  t,
}: ComplianceChecklistTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">{t.checklist.title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
            <col className="w-[46%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/90 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3">{t.checklist.columnItem}</th>
              <th className="px-4 py-3">{t.checklist.columnCategory}</th>
              <th className="px-4 py-3">{t.checklist.columnStatus}</th>
              <th className="px-6 py-3">{t.checklist.columnExplanation}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {checklist.map((item) => (
              <tr key={item.id} className="align-top hover:bg-slate-50/70">
                <td className="px-6 py-4">
                  <p className="font-medium leading-snug text-slate-900">{t.checklist[item.labelKey]}</p>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    {t.checklist[item.categoryKey]}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={item.status} label={getCheckStatusLabel(item.status, t)} />
                </td>
                <td className="px-6 py-4 text-[13px] leading-relaxed text-slate-600">
                  {item.explanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
