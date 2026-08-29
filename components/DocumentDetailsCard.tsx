import {
  Building2,
  Calendar,
  FileType,
  AlertTriangle,
  Hash,
  User,
  Truck,
  Weight,
  PenLine,
  Stamp,
} from "lucide-react";
import type { AuditResult } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { StatusBadge, getRiskLabel } from "@/components/StatusBadge";

interface DocumentDetailsCardProps {
  document: AuditResult["document"];
  t: Translations;
}

export function DocumentDetailsCard({ document, t }: DocumentDetailsCardProps) {
  const categoryLabel =
    t.documentCategory[document.documentCategory] ?? document.documentCategory;

  const fields = [
    { icon: Building2, label: t.document.carrierName, value: document.carrierName },
    { icon: User, label: t.document.shipper, value: document.shipper || "—" },
    { icon: User, label: t.document.consignee, value: document.consignee || "—" },
    { icon: Truck, label: t.document.vehiclePlate, value: document.vehiclePlate || "—" },
    { icon: Weight, label: t.document.cargoWeight, value: document.cargoWeight || "—" },
    { icon: Hash, label: t.document.shipmentReference, value: document.shipmentReference },
    { icon: Calendar, label: t.document.documentDate, value: document.documentDate },
    { icon: FileType, label: t.document.documentType, value: document.documentType },
  ];

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">{t.document.title}</h2>
        <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          {categoryLabel}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
            <p className="mt-1.5 truncate text-sm font-semibold text-slate-900" title={value}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <PenLine className="h-4 w-4 text-slate-400" />
            {t.document.signaturePresent}
          </div>
          <StatusBadge
            status={document.signaturePresent ? "compliant" : "missing"}
            label={document.signaturePresent ? t.document.present : t.document.notPresent}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Stamp className="h-4 w-4 text-slate-400" />
            {t.document.stampPresent}
          </div>
          <StatusBadge
            status={document.stampPresent ? "compliant" : "missing"}
            label={document.stampPresent ? t.document.present : t.document.notPresent}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <AlertTriangle className="h-4 w-4 text-slate-400" />
            {t.document.riskLevel}
          </div>
          <StatusBadge
            status={document.riskLevel}
            label={getRiskLabel(document.riskLevel, t)}
            size="md"
          />
        </div>
      </div>
    </section>
  );
}
