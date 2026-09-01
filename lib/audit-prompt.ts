/**
 * System prompt and JSON response schema for Dockify Document Auditor (GPT-4o).
 */

export const DOCKIFY_AUDIT_SYSTEM_PROMPT = `You are the Dockify Document Auditor — a strict AI auditor for logistics freight documents (CMR consignment notes, Proof of Delivery / POD, and transport invoices).

Your sole job is to EXTRACT and VERIFY critical shipment fields from the provided document (text and/or image), then return ONLY structured JSON matching the required schema. Do not invent values that are not visible or stated. If a field cannot be read, set it to an empty string or false as appropriate and mark related checklist items as "missing" or "unclear".

## Mandatory extraction & verification fields

You MUST always attempt to extract and verify these fields on every CMR, POD, and invoice:

1. **shipper** — Name (and address if present) of the sender / shipper
2. **consignee** — Name (and address if present) of the receiver / consignee
3. **vehiclePlate** — Truck / trailer / vehicle registration plate number(s)
4. **cargoWeight** — Cargo weight as stated (include unit, e.g. "4820 kg"); empty string if absent
5. **signaturePresent** — true if a handwritten, stamped, or electronic signature of acceptance/delivery is clearly present; otherwise false
6. **stampPresent** — true if a company/customs/warehouse stamp is clearly present; otherwise false

Also capture: carrierName, documentDate (YYYY-MM-DD), documentType, documentCategory (cmr | pod | invoice | unknown), shipmentReference, and overall riskLevel.

## Document types

- **CMR** — International consignment note. Verify parties, route, goods, weight, vehicle plate, and signatures/stamps.
- **POD** — Proof of Delivery. Verify delivery confirmation, consignee identity, signature/stamp, date/time, and cargo condition notes.
- **Invoice** — Transport/freight invoice. Verify billing header, shipper/consignee references, weight/charges alignment, VAT, and payment terms.

## Verification checklist statuses

- \`compliant\` — Present, complete, and consistent
- \`missing\` — Required field or section not found
- \`unclear\` — Partially present, illegible, or ambiguous

### Checklist items (include those relevant to the detected document type)
- cmrConsignmentNote, cmrPartiesAndRoute, cmrGoodsAndWeight
- podDeliveryConfirmation, podSignatureAndTimestamp, podConditionNotes
- invoiceHeaderDetails, invoiceLineItemsMatch, invoiceVatAndPayment

## Risk level rules

- \`compliant\` — Critical fields present (shipper, consignee, weight where required, signature/stamp as applicable); billing/dispatch ready
- \`action_needed\` — Minor gaps or clarifications required
- \`high_risk\` — Missing signature/stamp, missing shipper/consignee, missing weight, or blocking mismatches

## Output rules (strict)

- Return ONLY valid JSON matching the schema — no markdown fences, no commentary
- Never expose chain-of-thought; put explanations only in checklist.explanation and discrepancies
- Use empty string for unknown text fields; use false when signature/stamp cannot be confirmed
- discrepancies: short strings for blocking issues (especially missing shipper, consignee, plate, weight, signature, or stamp)
- followUpEmail: professional email requesting the missing fields/documents
- The follow-up email subject and body MUST be written strictly in the selected recipient language, independent of the source document language`;

export const DOCKIFY_AUDIT_JSON_SCHEMA = {
  type: "object",
  required: [
    "document",
    "checklist",
    "discrepancies",
    "followUpEmail",
    "analyzedAt",
  ],
  properties: {
    document: {
      type: "object",
      required: [
        "carrierName",
        "shipper",
        "consignee",
        "vehiclePlate",
        "cargoWeight",
        "signaturePresent",
        "stampPresent",
        "documentDate",
        "documentType",
        "documentCategory",
        "shipmentReference",
        "riskLevel",
      ],
      properties: {
        carrierName: { type: "string", description: "Carrier or haulier name" },
        shipper: { type: "string", description: "Shipper / sender name" },
        consignee: { type: "string", description: "Consignee / receiver name" },
        vehiclePlate: {
          type: "string",
          description: "Vehicle / trailer registration plate",
        },
        cargoWeight: {
          type: "string",
          description: "Cargo weight with unit, e.g. 4820 kg",
        },
        signaturePresent: {
          type: "boolean",
          description: "Whether a signature is clearly present",
        },
        stampPresent: {
          type: "boolean",
          description: "Whether a stamp is clearly present",
        },
        documentDate: {
          type: "string",
          description: "Primary document date (YYYY-MM-DD)",
        },
        documentType: {
          type: "string",
          description: "Human-readable document label",
        },
        documentCategory: {
          type: "string",
          enum: ["cmr", "pod", "invoice", "unknown"],
        },
        shipmentReference: {
          type: "string",
          description: "CMR, shipment, or order reference number",
        },
        riskLevel: {
          type: "string",
          enum: ["compliant", "action_needed", "high_risk"],
        },
      },
    },
    checklist: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "labelKey", "categoryKey", "status", "explanation"],
        properties: {
          id: { type: "string" },
          labelKey: {
            type: "string",
            enum: [
              "cmrConsignmentNote",
              "cmrPartiesAndRoute",
              "cmrGoodsAndWeight",
              "podDeliveryConfirmation",
              "podSignatureAndTimestamp",
              "podConditionNotes",
              "invoiceHeaderDetails",
              "invoiceLineItemsMatch",
              "invoiceVatAndPayment",
            ],
          },
          categoryKey: {
            type: "string",
            enum: ["categoryCmr", "categoryPod", "categoryInvoice"],
          },
          status: {
            type: "string",
            enum: ["compliant", "missing", "unclear"],
          },
          explanation: { type: "string" },
        },
      },
    },
    discrepancies: {
      type: "array",
      items: { type: "string" },
      description: "Blocking issues, missing fields, or mismatches",
    },
    followUpEmail: {
      type: "object",
      required: ["subject", "body"],
      properties: {
        subject: { type: "string" },
        body: { type: "string" },
      },
    },
    analyzedAt: {
      type: "string",
      description: "ISO 8601 timestamp of analysis",
    },
    sourceFile: { type: "string" },
  },
} as const;

export function buildFollowUpEmailLanguageInstruction(recipientLanguage: string): string {
  return `Generate a professional compliance follow-up email regarding the audit findings strictly in ${recipientLanguage}.
Write both followUpEmail.subject and followUpEmail.body entirely in ${recipientLanguage}.
Do not use the source document's original language. A Japanese CMR, Chinese invoice, or any other source language must still produce a ${recipientLanguage} email when ${recipientLanguage} is the selected recipient language.
Keep proper names, plate numbers, shipment references, weights, and dates as extracted.`;
}

export function buildAuditUserPrompt(
  documentText: string,
  fileName: string,
  recipientLanguage: string,
): string {
  return `Audit this logistics document as the Dockify Document Auditor.
Extract and verify shipper, consignee, vehicle plate, cargo weight, and signature/stamp presence.
Return the JSON audit report only.

${buildFollowUpEmailLanguageInstruction(recipientLanguage)}

Source file: ${fileName}

--- DOCUMENT TEXT START ---
${documentText}
--- DOCUMENT TEXT END ---`;
}

export function buildFollowUpEmailUserPrompt(options: {
  recipientLanguage: string;
  sourceFile?: string;
  document: Record<string, unknown>;
  discrepancies: string[];
  checklist: Array<Record<string, unknown>>;
}): string {
  return `${buildFollowUpEmailLanguageInstruction(options.recipientLanguage)}

Return ONLY JSON with "subject" and "body". Do not include markdown.

Source file: ${options.sourceFile ?? "unknown"}
Document findings (JSON):
${JSON.stringify(
  {
    document: options.document,
    discrepancies: options.discrepancies,
    checklist: options.checklist,
  },
  null,
  2,
)}`;
}
