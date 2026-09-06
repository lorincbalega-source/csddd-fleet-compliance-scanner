"use client";

import { FileText } from "lucide-react";
import type { DocumentEntity, DocumentPage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  entity: DocumentEntity;
}

export function DocumentViewer({ entity }: DocumentViewerProps) {
  const pdfSrc = entity.fileKind === "pdf" ? entity.fileUrl ?? entity.pages[0]?.src : undefined;

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-slate-200/70">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-brand-600" />
          <p className="truncate text-sm font-semibold text-slate-900">{entity.fileName}</p>
        </div>
        <p className="shrink-0 text-xs font-medium text-slate-500">
          {entity.pages.length} {entity.pages.length === 1 ? "page" : "pages"}
        </p>
      </div>

      <div
        className="document-viewer-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4"
        onWheelCapture={stopEntitySlide}
        onTouchMoveCapture={stopEntitySlide}
      >
        {pdfSrc ? (
          <iframe
            title={entity.fileName}
            src={pdfSrc}
            className="min-h-full w-full rounded-lg border border-slate-300 bg-white"
            style={{ height: "calc(100% - 0px)", minHeight: "1400px" }}
          />
        ) : (
          <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5">
            {entity.pages.map((page, index) => (
              <MockPaperPage
                key={page.id}
                page={page}
                index={index}
                entity={entity}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function stopEntitySlide(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

function MockPaperPage({
  page,
  index,
  entity,
}: {
  page: DocumentPage;
  index: number;
  entity: DocumentEntity;
}) {
  const doc = entity.audit?.document;
  const variant = page.mockVariant ?? "cmr";

  if (page.kind === "image" && page.src) {
    return (
      <figure className="overflow-hidden rounded-sm bg-white shadow-[0_12px_40px_rgba(15,23,42,0.18)] ring-1 ring-slate-300">
        <img src={page.src} alt={page.label} className="block w-full" />
        <figcaption className="border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-center text-[11px] font-medium text-slate-500">
          {page.label}
        </figcaption>
      </figure>
    );
  }

  if (!doc) {
    return (
      <article className="relative min-h-[420px] bg-white px-8 py-7 shadow-[0_12px_40px_rgba(15,23,42,0.18)] ring-1 ring-slate-300">
        <p className="text-sm font-medium text-slate-500">Analyzing page…</p>
      </article>
    );
  }

  return (
    <article className="relative bg-white px-8 py-7 shadow-[0_12px_40px_rgba(15,23,42,0.18)] ring-1 ring-slate-300">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {variant === "invoice" ? "Freight invoice" : variant === "pod" ? "Proof of delivery" : "CMR consignment note"}
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">{doc.shipmentReference}</h3>
        </div>
        <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
          {page.label} / {entity.pages.length}
        </span>
      </div>

      {variant === "invoice" ? (
        <InvoiceBody index={index} entity={entity} />
      ) : variant === "pod" ? (
        <PodBody index={index} entity={entity} />
      ) : (
        <CmrBody index={index} entity={entity} />
      )}
    </article>
  );
}

function Field({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className={cn("rounded border px-2.5 py-2", warn ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50")}>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={cn("mt-0.5 text-xs font-medium", warn ? "text-red-700" : "text-slate-800")}>{value || "—"}</p>
    </div>
  );
}

function CmrBody({ index, entity }: { index: number; entity: DocumentEntity }) {
  const doc = entity.audit?.document;
  if (!doc) return null;
  if (index === 0) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Field label="1. Sender" value={doc.shipper} />
        <Field label="2. Consignee" value={doc.consignee} />
        <Field label="16. Carrier" value={doc.carrierName} />
        <Field label="Plate" value={doc.vehiclePlate} />
        <Field label="Date" value={doc.documentDate} />
        <Field label="11. Gross weight" value={doc.cargoWeight} warn={!doc.cargoWeight || doc.cargoWeight.includes("missing")} />
        <div className="col-span-2 rounded border border-slate-200 px-2.5 py-8 text-center text-xs text-slate-400">
          Goods: automotive parts — pallet count as declared
        </div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-700">Successive carriers / remarks</p>
        <div className="h-28 rounded border border-dashed border-slate-200 bg-slate-50" />
        <p className="text-xs text-slate-500">Special agreements and cash-on-delivery instructions.</p>
        <div className="h-24 rounded border border-dashed border-slate-200 bg-slate-50" />
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <StampBox label="Carrier stamp" present={doc.stampPresent} />
        <StampBox label="Sender signature" present={doc.signaturePresent} />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-700">Delivery confirmation (reverse)</p>
      <StampBox label="Consignee acceptance" present={false} />
      <div className="h-32 rounded border border-dashed border-slate-200 bg-slate-50 text-center text-[11px] leading-[8rem] text-slate-400">
        Arrival time / reservations
      </div>
    </div>
  );
}

function PodBody({ index, entity }: { index: number; entity: DocumentEntity }) {
  const doc = entity.audit?.document;
  if (!doc) return null;
  if (index === 0) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Field label="Deliver to" value={doc.consignee} />
        <Field label="Shipper" value={doc.shipper} />
        <Field label="Vehicle" value={doc.vehiclePlate} />
        <Field label="Weight" value={doc.cargoWeight} />
        <Field label="POD date" value={doc.documentDate} />
        <Field label="Reference" value={doc.shipmentReference} />
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-600">Piece count and condition checklist.</p>
        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          {["Cartons", "Pallets", "Exceptions"].map((item) => (
            <div key={item} className="rounded border border-slate-200 py-6 text-slate-500">
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4">
      <StampBox label="Receiver signature" present={doc.signaturePresent} />
      <StampBox label="Warehouse seal" present={doc.stampPresent} />
    </div>
  );
}

function InvoiceBody({ index, entity }: { index: number; entity: DocumentEntity }) {
  const doc = entity.audit?.document;
  if (!doc) return null;
  if (index === 0) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Bill to" value={doc.shipper} />
          <Field label="From" value={doc.carrierName} />
          <Field label="Invoice date" value={doc.documentDate} />
          <Field label="Shipment" value={doc.shipmentReference} />
        </div>
        <table className="w-full text-left text-[11px]">
          <thead className="text-slate-400">
            <tr>
              <th className="py-1 font-medium">Description</th>
              <th className="py-1 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="text-slate-800">
            <tr className="border-t border-slate-100">
              <td className="py-2">Linehaul Munich–Budapest</td>
              <td>€1,040.00</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="py-2">Fuel surcharge</td>
              <td>€200.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="space-y-2">
        <Field label="VAT" value="" warn />
        <Field label="IBAN" value="" warn />
        <Field label="Weight on invoice" value={doc.cargoWeight} warn={!doc.cargoWeight} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4">
      <StampBox label="Issuer stamp" present={doc.stampPresent} />
      <StampBox label="Authorized signatory" present={doc.signaturePresent} />
    </div>
  );
}

function StampBox({ label, present }: { label: string; present: boolean }) {
  return (
    <div
      className={cn(
        "flex h-36 flex-col items-center justify-center rounded-md border-2 border-dashed",
        present ? "border-emerald-300 bg-emerald-50/60" : "border-red-200 bg-red-50/50",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={cn("mt-2 text-sm font-semibold", present ? "text-emerald-700" : "text-red-600")}>
        {present ? "Present" : "Missing"}
      </p>
    </div>
  );
}
