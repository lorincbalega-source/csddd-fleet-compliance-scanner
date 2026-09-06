"use client";

import { PenLine, Stamp } from "lucide-react";
import type { DocumentEntity } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { StatusBadge, getRiskLabel } from "@/components/StatusBadge";

interface SlideAuditPanelProps {
  entity: DocumentEntity;
  t: Translations;
}

export function SlideAuditPanel({ entity, t }: SlideAuditPanelProps) {
  if (!entity.audit) return null;
  const doc = entity.audit.document;
  const fields = [
    [t.document.carrierName, doc.carrierName],
    [t.document.shipper, doc.shipper || "—"],
    [t.document.consignee, doc.consignee || "—"],
    [t.document.vehiclePlate, doc.vehiclePlate || "—"],
    [t.document.cargoWeight, doc.cargoWeight || "—"],
    [t.document.shipmentReference, doc.shipmentReference],
    [t.document.documentDate, doc.documentDate],
    [t.document.documentType, doc.documentType],
  ] as const;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-3">
        <h2 className="text-sm font-semibold text-slate-900">{t.crm.extractedFields}</h2>
        <StatusBadge status={doc.riskLevel} label={getRiskLabel(doc.riskLevel, t)} size="md" />
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4"
        onWheelCapture={(event) => event.stopPropagation()}
      >
        <div className="grid grid-cols-2 gap-2">
          {fields.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-slate-900" title={value}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <SealRow
            icon={PenLine}
            label={t.document.signaturePresent}
            present={doc.signaturePresent}
            t={t}
          />
          <SealRow icon={Stamp} label={t.document.stampPresent} present={doc.stampPresent} t={t} />
        </div>

        {entity.audit.discrepancies.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {entity.audit.discrepancies.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-amber-200/80 bg-amber-50 px-2.5 py-2 text-xs text-amber-950"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function SealRow({
  icon: Icon,
  label,
  present,
  t,
}: {
  icon: typeof PenLine;
  label: string;
  present: boolean;
  t: Translations;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        {label}
      </div>
      <StatusBadge
        status={present ? "compliant" : "missing"}
        label={present ? t.document.present : t.document.notPresent}
      />
    </div>
  );
}
