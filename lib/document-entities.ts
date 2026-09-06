import { MOCK_AUDIT_RESULT } from "./mock-data";
import { composeFollowUpEmail } from "./email-templates";
import type { AuditResult, DocumentEntity, DocumentPage } from "./types";

function makeMockPages(
  prefix: string,
  count: number,
  variant: DocumentPage["mockVariant"],
): DocumentPage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-p${index + 1}`,
    label: `Page ${index + 1}`,
    kind: "mock",
    mockVariant: variant,
  }));
}

const cmrAudit: AuditResult = {
  ...MOCK_AUDIT_RESULT,
  analyzedAt: "2026-09-06T08:12:00.000Z",
  sourceFile: "CMR_DE_HU_2025_88421.pdf",
  followUpEmail: composeFollowUpEmail("en", MOCK_AUDIT_RESULT.document, MOCK_AUDIT_RESULT.discrepancies),
};

const podAudit: AuditResult = {
  analyzedAt: "2026-09-06T08:18:00.000Z",
  sourceFile: "POD_AutoParts_Budapest_scan.pdf",
  document: {
    carrierName: "TransEuro Logistics GmbH",
    shipper: "BMW AG, Munich",
    consignee: "AutoParts Kft., Budapest",
    vehiclePlate: "M-TE 4821",
    cargoWeight: "4820 kg",
    signaturePresent: false,
    stampPresent: false,
    documentDate: "2025-11-15",
    documentType: "Proof of Delivery (PDF)",
    documentCategory: "pod",
    shipmentReference: "POD-HU-2025-88421",
    riskLevel: "high_risk",
  },
  checklist: [
    {
      id: "pod-delivery",
      labelKey: "podDeliveryConfirmation",
      categoryKey: "categoryPod",
      status: "unclear",
      explanation: "Delivery address matches CMR consignee, but goods-received box is unchecked.",
    },
    {
      id: "pod-signature",
      labelKey: "podSignatureAndTimestamp",
      categoryKey: "categoryPod",
      status: "missing",
      explanation: "Consignee signature, warehouse stamp, and delivery timestamp are absent on all pages.",
    },
    {
      id: "pod-condition",
      labelKey: "podConditionNotes",
      categoryKey: "categoryPod",
      status: "missing",
      explanation: "No exception or cargo-condition remarks. Cannot confirm intact delivery.",
    },
  ],
  discrepancies: [
    "Consignee signature missing on POD page 1 and 2.",
    "Warehouse / company seal not present.",
    "Delivery date/time field is blank.",
  ],
  followUpEmail: { subject: "", body: "" },
};

podAudit.followUpEmail = composeFollowUpEmail("en", podAudit.document, podAudit.discrepancies);

const invoiceAudit: AuditResult = {
  analyzedAt: "2026-09-06T08:24:00.000Z",
  sourceFile: "INV_TE_2025_1102.pdf",
  document: {
    carrierName: "TransEuro Logistics GmbH",
    shipper: "BMW AG, Munich",
    consignee: "AutoParts Kft., Budapest",
    vehiclePlate: "M-TE 4821 / HU-B-90234",
    cargoWeight: "",
    signaturePresent: true,
    stampPresent: true,
    documentDate: "2025-11-16",
    documentType: "Transport Invoice (PDF)",
    documentCategory: "invoice",
    shipmentReference: "INV-TE-2025-1102",
    riskLevel: "action_needed",
  },
  checklist: [
    {
      id: "invoice-header",
      labelKey: "invoiceHeaderDetails",
      categoryKey: "categoryInvoice",
      status: "compliant",
      explanation: "Invoice number INV-TE-2025-1102 and billing entity are present.",
    },
    {
      id: "invoice-lines",
      labelKey: "invoiceLineItemsMatch",
      categoryKey: "categoryInvoice",
      status: "unclear",
      explanation: "Freight line €1,240.00 does not split fuel surcharge vs. tolls. Weight field empty.",
    },
    {
      id: "invoice-vat",
      labelKey: "invoiceVatAndPayment",
      categoryKey: "categoryInvoice",
      status: "missing",
      explanation: "VAT rate and IBAN are missing from page 2 payment block.",
    },
  ],
  discrepancies: [
    "Cargo weight not stated on invoice header.",
    "VAT breakdown missing.",
    "Bank / IBAN details absent on payment page.",
  ],
  followUpEmail: { subject: "", body: "" },
};

invoiceAudit.followUpEmail = composeFollowUpEmail(
  "en",
  invoiceAudit.document,
  invoiceAudit.discrepancies,
);

const compliantAudit: AuditResult = {
  analyzedAt: "2026-09-06T08:31:00.000Z",
  sourceFile: "CMR_NordHaul_PL_2025_4410.pdf",
  document: {
    carrierName: "NordHaul Sp. z o.o.",
    shipper: "Bosch GmbH, Stuttgart",
    consignee: "ELKO EP, Brno",
    vehiclePlate: "PO-NH 2291",
    cargoWeight: "2100 kg gross",
    signaturePresent: true,
    stampPresent: true,
    documentDate: "2025-11-12",
    documentType: "CMR Consignment Note (PDF)",
    documentCategory: "cmr",
    shipmentReference: "CMR-PL-CZ-2025-4410",
    riskLevel: "compliant",
  },
  checklist: [
    {
      id: "cmr-note",
      labelKey: "cmrConsignmentNote",
      categoryKey: "categoryCmr",
      status: "compliant",
      explanation: "CMR number and date are complete.",
    },
    {
      id: "cmr-parties",
      labelKey: "cmrPartiesAndRoute",
      categoryKey: "categoryCmr",
      status: "compliant",
      explanation: "Shipper, carrier, and consignee addresses match the booking.",
    },
    {
      id: "cmr-weight",
      labelKey: "cmrGoodsAndWeight",
      categoryKey: "categoryCmr",
      status: "compliant",
      explanation: "Gross weight 2,100 kg and 6 pallets are recorded.",
    },
  ],
  discrepancies: [],
  followUpEmail: { subject: "", body: "" },
};

compliantAudit.followUpEmail = composeFollowUpEmail(
  "en",
  compliantAudit.document,
  [
    "No blocking discrepancies. Please confirm receipt of this clean-file notice if any copy is outstanding on your side.",
  ],
);

const photoPodAudit: AuditResult = {
  analyzedAt: "2026-09-06T09:02:00.000Z",
  sourceFile: "POD_warehouse_photo_p1-p3.jpg",
  document: {
    carrierName: "Danube Freight SRL",
    shipper: "Continental AG, Timisoara",
    consignee: "Renault, Novo Mesto",
    vehiclePlate: "TM-88-DNF",
    cargoWeight: "3650 kg",
    signaturePresent: true,
    stampPresent: false,
    documentDate: "2025-11-18",
    documentType: "Proof of Delivery (photo scan)",
    documentCategory: "pod",
    shipmentReference: "POD-RO-SI-2025-772",
    riskLevel: "action_needed",
  },
  checklist: [
    {
      id: "pod-delivery-2",
      labelKey: "podDeliveryConfirmation",
      categoryKey: "categoryPod",
      status: "compliant",
      explanation: "Consignee and unloading point are readable on page 1.",
    },
    {
      id: "pod-sign-2",
      labelKey: "podSignatureAndTimestamp",
      categoryKey: "categoryPod",
      status: "unclear",
      explanation: "Handwritten signature present; company seal cropped off page 3.",
    },
    {
      id: "pod-cond-2",
      labelKey: "podConditionNotes",
      categoryKey: "categoryPod",
      status: "compliant",
      explanation: "No damage remarks; 14 cartons counted.",
    },
  ],
  discrepancies: [
    "Company seal is cut off on the last photo page — please resend a full-frame stamp image.",
  ],
  followUpEmail: { subject: "", body: "" },
};

photoPodAudit.followUpEmail = composeFollowUpEmail(
  "en",
  photoPodAudit.document,
  photoPodAudit.discrepancies,
);

export const SAMPLE_DOCUMENT_QUEUE: DocumentEntity[] = [
  {
    id: "doc-cmr-88421",
    recipientName: "TransEuro Logistics GmbH",
    recipientEmail: "ops@transeuro.example",
    fileName: "CMR_DE_HU_2025_88421.pdf",
    fileKind: "mock",
    pages: makeMockPages("cmr-88421", 4, "cmr"),
    audit: cmrAudit,
    reviewStatus: "pending",
  },
  {
    id: "doc-pod-88421",
    recipientName: "TransEuro Logistics GmbH",
    recipientEmail: "ops@transeuro.example",
    fileName: "POD_AutoParts_Budapest_scan.pdf",
    fileKind: "mock",
    pages: makeMockPages("pod-88421", 3, "pod"),
    audit: podAudit,
    reviewStatus: "pending",
  },
  {
    id: "doc-inv-1102",
    recipientName: "TransEuro Billing",
    recipientEmail: "billing@transeuro.example",
    fileName: "INV_TE_2025_1102.pdf",
    fileKind: "mock",
    pages: makeMockPages("inv-1102", 3, "invoice"),
    audit: invoiceAudit,
    reviewStatus: "pending",
  },
  {
    id: "doc-cmr-4410",
    recipientName: "NordHaul Sp. z o.o.",
    recipientEmail: "dispatch@nordhaul.example",
    fileName: "CMR_NordHaul_PL_2025_4410.pdf",
    fileKind: "mock",
    pages: makeMockPages("cmr-4410", 2, "cmr"),
    audit: compliantAudit,
    reviewStatus: "pending",
  },
  {
    id: "doc-pod-772",
    recipientName: "Danube Freight SRL",
    recipientEmail: "office@danubefreight.example",
    fileName: "POD_warehouse_photo_p1-p3.jpg",
    fileKind: "mock",
    pages: makeMockPages("pod-772", 3, "pod"),
    audit: photoPodAudit,
    reviewStatus: "pending",
  },
];

export function cloneSampleQueue(): DocumentEntity[] {
  return SAMPLE_DOCUMENT_QUEUE.map((entity) => ({
    ...entity,
    pages: entity.pages.map((page) => ({ ...page })),
    audit: { ...entity.audit, document: { ...entity.audit.document } },
    reviewStatus: "pending",
  }));
}

export function auditResultToEntity(
  audit: AuditResult,
  file?: File | null,
): DocumentEntity {
  const fileUrl = file ? URL.createObjectURL(file) : undefined;
  const isPdf = Boolean(file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")));
  const isImage = Boolean(file && file.type.startsWith("image/"));

  const previewPages: DocumentPage[] =
    isImage && fileUrl
      ? [{ id: "upload-1", label: "Page 1", kind: "image", src: fileUrl }]
      : isPdf && fileUrl
        ? [{ id: "upload-pdf", label: "Document", kind: "pdf", src: fileUrl }]
        : pagesForCategory(audit.document.documentCategory);

  return {
    id: `doc-${Date.now()}`,
    recipientName: audit.document.carrierName,
    recipientEmail: "ops@carrier.example",
    fileName: audit.sourceFile ?? file?.name ?? "document.pdf",
    fileKind: isPdf ? "pdf" : isImage ? "image" : "mock",
    fileUrl,
    pages: previewPages,
    audit,
    reviewStatus: "pending",
  };
}

function pagesForCategory(category: AuditResult["document"]["documentCategory"]): DocumentPage[] {
  if (category === "invoice") return makeMockPages("live-inv", 3, "invoice");
  if (category === "pod") return makeMockPages("live-pod", 3, "pod");
  return makeMockPages("live-cmr", 4, "cmr");
}
