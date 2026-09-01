import type { AuditResult, DocumentDetails, FollowUpEmail, VerificationCheckItem } from "./types";
import { buildMockAuditResult } from "./mock-data";
import {
  DOCKIFY_AUDIT_SYSTEM_PROMPT,
  DOCKIFY_AUDIT_JSON_SCHEMA,
  buildAuditUserPrompt,
} from "./audit-prompt";
import {
  extractDocumentText,
  fileToImageDataUrl,
  generateFollowUpEmail,
  isImageFile,
  runOpenAIAudit,
} from "./openai-audit";
import { resolveRecipientLanguage } from "./languages";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SIMULATED_DELAY_MS = 2200;

/** Exported for OpenAI integration — system prompt + JSON schema used by GPT-4o. */
export const auditPromptConfig = {
  systemPrompt: DOCKIFY_AUDIT_SYSTEM_PROMPT,
  jsonSchema: DOCKIFY_AUDIT_JSON_SCHEMA,
  buildUserPrompt: buildAuditUserPrompt,
};

async function analyzeDocument(file: File, recipientLanguage?: string): Promise<AuditResult> {
  const documentText = await extractDocumentText(file);
  const imageDataUrl = isImageFile(file) ? await fileToImageDataUrl(file) : undefined;

  return runOpenAIAudit({
    fileName: file.name,
    documentText,
    imageDataUrl,
    recipientLanguage,
  });
}

export async function runAudit(options: {
  useMock?: boolean;
  file?: File;
  recipientLanguage?: string;
}): Promise<AuditResult> {
  if (options.useMock) {
    await delay(SIMULATED_DELAY_MS);
    return buildMockAuditResult();
  }

  if (!options.file) {
    throw new Error("NO_FILE");
  }

  const ext = options.file.name.slice(options.file.name.lastIndexOf(".")).toLowerCase();
  if (!ACCEPTED_TYPES.includes(options.file.type) && !ACCEPTED_EXTENSIONS.includes(ext)) {
    throw new Error("INVALID_FILE_TYPE");
  }

  if (options.file.size > MAX_FILE_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  return analyzeDocument(options.file, options.recipientLanguage);
}

export async function runFollowUpEmail(options: {
  recipientLanguage?: string;
  document: DocumentDetails;
  discrepancies: string[];
  checklist: VerificationCheckItem[];
  sourceFile?: string;
}): Promise<FollowUpEmail> {
  resolveRecipientLanguage(options.recipientLanguage);
  return generateFollowUpEmail(options);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
