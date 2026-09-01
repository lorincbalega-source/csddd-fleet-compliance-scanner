import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import type {
  AuditResult,
  CheckStatus,
  ChecklistCategoryKey,
  ChecklistLabelKey,
  DocumentCategory,
  DocumentDetails,
  FollowUpEmail,
  RiskLevel,
  VerificationCheckItem,
} from "./types";
import {
  DOCKIFY_AUDIT_JSON_SCHEMA,
  buildAuditUserPrompt,
  buildFollowUpEmailLanguageInstruction,
  buildFollowUpEmailUserPrompt,
} from "./audit-prompt";
import { DOCKIFY_SYSTEM_PROMPT, getOpenAIClient } from "./openai";
import { resolveRecipientLanguage } from "./languages";

const LABEL_KEYS = new Set<ChecklistLabelKey>([
  "cmrConsignmentNote",
  "cmrPartiesAndRoute",
  "cmrGoodsAndWeight",
  "podDeliveryConfirmation",
  "podSignatureAndTimestamp",
  "podConditionNotes",
  "invoiceHeaderDetails",
  "invoiceLineItemsMatch",
  "invoiceVatAndPayment",
]);

const CATEGORY_KEYS = new Set<ChecklistCategoryKey>([
  "categoryCmr",
  "categoryPod",
  "categoryInvoice",
]);

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

/**
 * Calls GPT-4o on the server with the Dockify Document Auditor system prompt.
 * The API key never leaves the server process.
 */
export async function runOpenAIAudit(options: {
  fileName: string;
  documentText: string;
  imageDataUrl?: string;
  recipientLanguage?: string;
}): Promise<AuditResult> {
  const client = getOpenAIClient();
  const recipientLanguage = resolveRecipientLanguage(options.recipientLanguage).name;

  const userContent: ChatCompletionContentPart[] = [
    {
      type: "text",
      text: buildAuditUserPrompt(options.documentText, options.fileName, recipientLanguage),
    },
  ];

  if (options.imageDataUrl) {
    userContent.push({
      type: "image_url",
      image_url: { url: options.imageDataUrl, detail: "high" },
    });
  }

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `${DOCKIFY_SYSTEM_PROMPT}\n\n## Follow-up email language\n${buildFollowUpEmailLanguageInstruction(recipientLanguage)}`,
    },
    { role: "user", content: userContent },
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "dockify_audit_result",
        strict: true,
        schema: toStrictJsonSchema(DOCKIFY_AUDIT_JSON_SCHEMA),
      },
    },
    messages,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OPENAI_EMPTY_RESPONSE");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OPENAI_INVALID_JSON");
  }

  return normalizeAuditResult(parsed, options.fileName);
}

const FOLLOW_UP_EMAIL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["subject", "body"],
  properties: {
    subject: { type: "string" },
    body: { type: "string" },
  },
} as const;

export async function generateFollowUpEmail(options: {
  recipientLanguage?: string;
  document: DocumentDetails;
  discrepancies: string[];
  checklist: VerificationCheckItem[];
  sourceFile?: string;
}): Promise<FollowUpEmail> {
  const client = getOpenAIClient();
  const recipientLanguage = resolveRecipientLanguage(options.recipientLanguage).name;

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "dockify_follow_up_email",
        strict: true,
        schema: FOLLOW_UP_EMAIL_SCHEMA,
      },
    },
    messages: [
      {
        role: "system",
        content: `You are the Dockify Document Auditor email writer.\n${buildFollowUpEmailLanguageInstruction(recipientLanguage)}`,
      },
      {
        role: "user",
        content: buildFollowUpEmailUserPrompt({
          recipientLanguage,
          sourceFile: options.sourceFile,
          document: options.document as unknown as Record<string, unknown>,
          discrepancies: options.discrepancies,
          checklist: options.checklist as unknown as Array<Record<string, unknown>>,
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OPENAI_EMPTY_RESPONSE");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OPENAI_INVALID_JSON");
  }

  const email = parsed as Record<string, unknown>;
  return {
    subject: String(email.subject ?? ""),
    body: String(email.body ?? ""),
  };
}

/** OpenAI strict mode requires additionalProperties: false on every object. */
function toStrictJsonSchema(schema: typeof DOCKIFY_AUDIT_JSON_SCHEMA): Record<string, unknown> {
  return {
    type: "object",
    additionalProperties: false,
    required: [...schema.required, "sourceFile"],
    properties: {
      document: {
        type: "object",
        additionalProperties: false,
        required: schema.properties.document.required,
        properties: schema.properties.document.properties,
      },
      checklist: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: schema.properties.checklist.items.required,
          properties: schema.properties.checklist.items.properties,
        },
      },
      discrepancies: {
        type: "array",
        items: { type: "string" },
      },
      followUpEmail: {
        type: "object",
        additionalProperties: false,
        required: schema.properties.followUpEmail.required,
        properties: schema.properties.followUpEmail.properties,
      },
      analyzedAt: { type: "string" },
      sourceFile: { type: "string" },
    },
  };
}

function normalizeAuditResult(raw: unknown, fallbackFileName: string): AuditResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("OPENAI_INVALID_JSON");
  }

  const data = raw as Record<string, unknown>;
  const document = data.document as Record<string, unknown> | undefined;
  const followUpEmail = data.followUpEmail as Record<string, unknown> | undefined;
  const checklistRaw = Array.isArray(data.checklist) ? data.checklist : [];
  const discrepancies = Array.isArray(data.discrepancies)
    ? data.discrepancies.filter((d): d is string => typeof d === "string")
    : [];

  if (!document || !followUpEmail) {
    throw new Error("OPENAI_INVALID_JSON");
  }

  return {
    document: {
      carrierName: String(document.carrierName ?? "Unknown carrier"),
      shipper: String(document.shipper ?? ""),
      consignee: String(document.consignee ?? ""),
      vehiclePlate: String(document.vehiclePlate ?? ""),
      cargoWeight: String(document.cargoWeight ?? ""),
      signaturePresent: Boolean(document.signaturePresent),
      stampPresent: Boolean(document.stampPresent),
      documentDate: String(document.documentDate ?? new Date().toISOString().slice(0, 10)),
      documentType: String(document.documentType ?? "Logistics Document"),
      documentCategory: asDocumentCategory(document.documentCategory),
      shipmentReference: String(document.shipmentReference ?? "N/A"),
      riskLevel: asRiskLevel(document.riskLevel),
    },
    checklist: checklistRaw
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item, index) => ({
        id: String(item.id ?? `check-${index}`),
        labelKey: asLabelKey(item.labelKey),
        categoryKey: asCategoryKey(item.categoryKey),
        status: asCheckStatus(item.status),
        explanation: String(item.explanation ?? ""),
      })),
    discrepancies,
    followUpEmail: {
      subject: String(followUpEmail.subject ?? "Action Required: Logistics Document Verification"),
      body: String(followUpEmail.body ?? ""),
    },
    analyzedAt:
      typeof data.analyzedAt === "string" ? data.analyzedAt : new Date().toISOString(),
    sourceFile:
      typeof data.sourceFile === "string" && data.sourceFile
        ? data.sourceFile
        : fallbackFileName,
  };
}

function asDocumentCategory(value: unknown): DocumentCategory {
  const allowed: DocumentCategory[] = ["cmr", "pod", "invoice", "unknown"];
  return allowed.includes(value as DocumentCategory)
    ? (value as DocumentCategory)
    : "unknown";
}

function asRiskLevel(value: unknown): RiskLevel {
  const allowed: RiskLevel[] = ["compliant", "action_needed", "high_risk"];
  return allowed.includes(value as RiskLevel)
    ? (value as RiskLevel)
    : "action_needed";
}

function asCheckStatus(value: unknown): CheckStatus {
  const allowed: CheckStatus[] = ["compliant", "missing", "unclear"];
  return allowed.includes(value as CheckStatus)
    ? (value as CheckStatus)
    : "unclear";
}

function asLabelKey(value: unknown): ChecklistLabelKey {
  return LABEL_KEYS.has(value as ChecklistLabelKey)
    ? (value as ChecklistLabelKey)
    : "cmrConsignmentNote";
}

function asCategoryKey(value: unknown): ChecklistCategoryKey {
  return CATEGORY_KEYS.has(value as ChecklistCategoryKey)
    ? (value as ChecklistCategoryKey)
    : "categoryCmr";
}

export function isImageFile(file: File): boolean {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return (
    IMAGE_MIME_TYPES.has(file.type) ||
    ext === ".jpg" ||
    ext === ".jpeg" ||
    ext === ".png"
  );
}

export async function fileToImageDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime =
    file.type === "image/jpg" || file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg")
      ? "image/jpeg"
      : file.type === "image/png" || file.name.toLowerCase().endsWith(".png")
        ? "image/png"
        : file.type || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

/**
 * Best-effort text extraction for uploaded files.
 * Images are handled via vision (image_url); this returns a short context note.
 */
export async function extractDocumentText(file: File): Promise<string> {
  if (isImageFile(file)) {
    return [
      `Image logistics document uploaded: ${file.name}`,
      `MIME type: ${file.type || "image"}`,
      `Size: ${file.size} bytes`,
      "",
      "Visually inspect the attached image.",
      "Extract shipper, consignee, vehicle plate, cargo weight, and whether signature/stamp are present.",
    ].join("\n");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const asUtf8 = buffer.toString("utf8");
  const printableRatio =
    asUtf8.length === 0
      ? 0
      : [...asUtf8].filter((ch) => {
          const code = ch.charCodeAt(0);
          return code === 9 || code === 10 || code === 13 || (code >= 32 && code < 127);
        }).length / asUtf8.length;

  if (printableRatio > 0.85 && asUtf8.trim().length > 40) {
    return asUtf8.slice(0, 80_000);
  }

  return [
    `Binary logistics document uploaded: ${file.name}`,
    `MIME type: ${file.type || "unknown"}`,
    `Size: ${file.size} bytes`,
    "",
    "Readable text could not be extracted from this binary file in the current pipeline.",
    "Infer the likely document category from the filename (CMR / POD / Invoice).",
    "Mark checklist items that require reading the document body as 'unclear' or 'missing'",
    "and list the specific fields the operations team should verify manually — especially",
    "shipper, consignee, vehicle plate, cargo weight, signature, and stamp.",
    "Still produce a complete Dockify JSON audit report and a useful follow-up email.",
  ].join("\n");
}
