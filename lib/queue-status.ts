import type { DocumentEntity, QueueVisualStatus } from "./types";

export function queueVisualStatus(entity: DocumentEntity): QueueVisualStatus {
  if (entity.reviewStatus === "approved") return "approved";
  if (entity.processingStatus === "failed") return "failed";
  if (entity.processingStatus !== "ready" || !entity.audit) return "processing";
  const hasGap =
    entity.audit.discrepancies.length > 0 ||
    entity.audit.document.riskLevel !== "compliant" ||
    !entity.audit.document.signaturePresent ||
    !entity.audit.document.stampPresent;
  return hasGap ? "discrepancy" : "ok";
}

export function isEntityReady(entity: DocumentEntity): boolean {
  return entity.processingStatus === "ready" && entity.audit !== null;
}
