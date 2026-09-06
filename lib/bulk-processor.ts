import { buildMockAuditResult } from "./mock-data";
import { getEntityFile, getInboxQueue, patchInboxEntity } from "./inbox-store";
import type { AuditResult } from "./types";

const CONCURRENCY = 2;
const inFlight = new Set<string>();
let started = false;

export function startBulkProcessor(): void {
  if (started) {
    void pump();
    return;
  }
  started = true;
  void pump();
}

async function pump(): Promise<void> {
  const queued = getInboxQueue().filter(
    (entity) => entity.processingStatus === "queued" && !inFlight.has(entity.id),
  );
  const slots = Math.max(0, CONCURRENCY - inFlight.size);
  const batch = queued.slice(0, slots);
  if (batch.length === 0) return;

  await Promise.all(batch.map((entity) => processEntity(entity.id)));
  if (getInboxQueue().some((entity) => entity.processingStatus === "queued")) {
    await pump();
  }
}

async function processEntity(id: string): Promise<void> {
  const file = getEntityFile(id);
  inFlight.add(id);
  patchInboxEntity(id, { processingStatus: "processing", errorMessage: undefined });

  try {
    const audit = file ? await analyzeFile(file) : buildMockAuditResult();
    patchInboxEntity(id, {
      processingStatus: "ready",
      audit,
      recipientName: audit.document.carrierName,
      errorMessage: undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AUDIT_FAILED";
    patchInboxEntity(id, {
      processingStatus: "failed",
      errorMessage: message,
    });
  } finally {
    inFlight.delete(id);
  }
}

async function analyzeFile(file: File): Promise<AuditResult> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/audit", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    return (await response.json()) as AuditResult;
  }

  const mock = buildMockAuditResult(file.name);
  mock.sourceFile = file.name;
  return mock;
}

export function retryEntity(id: string): void {
  patchInboxEntity(id, { processingStatus: "queued", errorMessage: undefined });
  void pump();
}
