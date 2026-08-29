import type { AuditResult } from "./types";

export const MOCK_AUDIT_RESULT: AuditResult = {
  document: {
    carrierName: "TransEuro Logistics GmbH",
    shipper: "BMW AG, Munich",
    consignee: "AutoParts Kft., Budapest",
    vehiclePlate: "M-TE 4821 / HU-B-90234",
    cargoWeight: "4820 kg (net); gross missing",
    signaturePresent: false,
    stampPresent: true,
    documentDate: "2025-11-14",
    documentType: "CMR Consignment Note (PDF)",
    documentCategory: "cmr",
    shipmentReference: "CMR-DE-HU-2025-88421",
    riskLevel: "action_needed",
  },
  checklist: [
    {
      id: "cmr-consignment-note",
      labelKey: "cmrConsignmentNote",
      categoryKey: "categoryCmr",
      status: "compliant",
      explanation:
        "CMR number CMR-DE-HU-2025-88421 and issue date are present. Standard CMR boxes 1–5 and 14–18 are completed.",
    },
    {
      id: "cmr-parties-route",
      labelKey: "cmrPartiesAndRoute",
      categoryKey: "categoryCmr",
      status: "compliant",
      explanation:
        "Sender (BMW AG, Munich), carrier (TransEuro Logistics GmbH), and consignee (AutoParts Kft., Budapest) are listed with full loading/unloading addresses.",
    },
    {
      id: "cmr-goods-weight",
      labelKey: "cmrGoodsAndWeight",
      categoryKey: "categoryCmr",
      status: "unclear",
      explanation:
        "Goods described as 'Automotive parts — 12 pallets' but gross weight field (box 11) is left blank. Net weight of 4,820 kg appears in box 12 only.",
    },
    {
      id: "pod-delivery",
      labelKey: "podDeliveryConfirmation",
      categoryKey: "categoryPod",
      status: "missing",
      explanation:
        "No separate POD attached. Delivery confirmation section on the CMR reverse is unsigned — cannot verify goods receipt at destination.",
    },
    {
      id: "pod-signature",
      labelKey: "podSignatureAndTimestamp",
      categoryKey: "categoryPod",
      status: "missing",
      explanation:
        "Consignee signature and delivery timestamp are absent. Required for proof of delivery and freight invoice approval.",
    },
    {
      id: "invoice-header",
      labelKey: "invoiceHeaderDetails",
      categoryKey: "categoryInvoice",
      status: "unclear",
      explanation:
        "Pro-forma freight charge (€1,240.00) noted in box 13 remarks but no formal invoice number, billing entity VAT ID, or payment due date provided.",
    },
    {
      id: "invoice-line-items",
      labelKey: "invoiceLineItemsMatch",
      categoryKey: "categoryInvoice",
      status: "missing",
      explanation:
        "No itemized freight charges, fuel surcharge breakdown, or toll fees documented. Cannot reconcile invoice against CMR shipment data.",
    },
    {
      id: "invoice-vat",
      labelKey: "invoiceVatAndPayment",
      categoryKey: "categoryInvoice",
      status: "missing",
      explanation:
        "VAT rate, tax amount, and bank/payment details are not included. Blocks accounts-payable processing.",
    },
  ],
  discrepancies: [
    "Gross weight missing on CMR box 11 — required for customs and liability calculations.",
    "No signed POD or delivery timestamp — shipment cannot be marked as delivered.",
    "Freight invoice lacks VAT breakdown and payment terms — blocks AP approval.",
    "Pro-forma charge in CMR remarks (€1,240.00) has no matching itemized invoice lines.",
    "Carrier stamp present at loading but consignee acceptance signature is missing.",
  ],
  followUpEmail: {
    subject:
      "Action Required: Missing CMR / POD / Invoice Items — Shipment CMR-DE-HU-2025-88421",
    body: `Dear TransEuro Logistics GmbH Operations Team,

Thank you for submitting the CMR consignment note for shipment CMR-DE-HU-2025-88421 dated November 14, 2025.

Our Dockify AI document verification has identified several items that require your attention before we can approve this shipment for billing:

1. CMR Gross Weight — Please complete box 11 (gross weight in kg) on the CMR. Only net weight is currently recorded.

2. Proof of Delivery (POD) — We require a signed POD or completed delivery confirmation with consignee signature, stamp, and delivery date/time.

3. Freight Invoice — Please submit a formal invoice including:
   - Invoice number and billing entity VAT ID
   - Itemized freight charges matching the €1,240.00 pro-forma amount noted on the CMR
   - VAT/tax breakdown and payment terms with bank details

4. Cross-Reference Check — Ensure the invoice shipment reference matches CMR-DE-HU-2025-88421 and the consignee details match AutoParts Kft., Budapest.

Please respond within 2 business days with the corrected documents. Shipments without complete CMR, POD, and invoice packages cannot be released for payment.

Best regards,
Fleet Operations Team
[Your Company Name]`,
  },
  analyzedAt: new Date().toISOString(),
  sourceFile: "CMR_DE_HU_2025_88421.pdf",
};

export function buildMockAuditResult(sourceFile?: string): AuditResult {
  return {
    ...MOCK_AUDIT_RESULT,
    analyzedAt: new Date().toISOString(),
    sourceFile: sourceFile ?? MOCK_AUDIT_RESULT.sourceFile,
    document: {
      ...MOCK_AUDIT_RESULT.document,
      carrierName: sourceFile
        ? deriveCarrierName(sourceFile)
        : MOCK_AUDIT_RESULT.document.carrierName,
      shipmentReference: sourceFile
        ? deriveShipmentReference(sourceFile)
        : MOCK_AUDIT_RESULT.document.shipmentReference,
      documentType: inferDocumentType(sourceFile),
      documentCategory: inferDocumentCategory(sourceFile),
    },
  };
}

function deriveCarrierName(fileName: string): string {
  const base = fileName.replace(/\.(pdf|docx)$/i, "").replace(/[_-]/g, " ");
  return base.length > 3 ? base : MOCK_AUDIT_RESULT.document.carrierName;
}

function deriveShipmentReference(fileName: string): string {
  const match = fileName.match(/(\d{4,})/);
  return match ? `CMR-REF-${match[1]}` : MOCK_AUDIT_RESULT.document.shipmentReference;
}

function inferDocumentType(fileName?: string): string {
  if (!fileName) return MOCK_AUDIT_RESULT.document.documentType;
  const lower = fileName.toLowerCase();
  if (lower.includes("pod")) return "Proof of Delivery (PDF)";
  if (lower.includes("invoice") || lower.includes("inv")) return "Transport Invoice (PDF)";
  if (lower.includes("cmr")) return "CMR Consignment Note (PDF)";
  return "Logistics Document (PDF)";
}

function inferDocumentCategory(fileName?: string): AuditResult["document"]["documentCategory"] {
  if (!fileName) return MOCK_AUDIT_RESULT.document.documentCategory;
  const lower = fileName.toLowerCase();
  if (lower.includes("pod")) return "pod";
  if (lower.includes("invoice") || lower.includes("inv")) return "invoice";
  if (lower.includes("cmr")) return "cmr";
  return "unknown";
}
