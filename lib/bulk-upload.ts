import { PDFDocument } from "pdf-lib";
import type { DocumentEntity, DocumentPage } from "./types";
import {
  appendInboxEntities,
  clearEntityFiles,
  getInboxQueue,
  setEntityFile,
  setInboxQueue,
} from "./inbox-store";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_UPLOAD_FILES = 10;
export const UPLOAD_ACCEPT =
  ".pdf,.docx,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type UploadFileError = "invalidFileType" | "fileTooLarge" | "tooManyFiles";

export function classifyUpload(file: File): "ok" | "type" | "size" {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const isImage =
    file.type.startsWith("image/") ||
    [".jpg", ".jpeg", ".png", ".webp", ".heic", ".gif"].includes(ext);
  const isPdf = file.type === "application/pdf" || ext === ".pdf";
  const isDocx =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx";
  if (!(isImage || isPdf || isDocx) || file.size <= 0) return "type";
  if (file.size > MAX_FILE_SIZE) return "size";
  return "ok";
}

export function isAcceptedUpload(file: File): boolean {
  return classifyUpload(file) === "ok";
}

export function mergeUploadedFiles(
  existing: File[],
  incoming: File[],
  options?: { maxFiles?: number; currentCount?: number },
): { files: File[]; added: File[]; error: UploadFileError | null } {
  const maxFiles = options?.maxFiles ?? MAX_UPLOAD_FILES;
  const currentCount = options?.currentCount ?? existing.length;
  const names = new Set(existing.map((file) => `${file.name}:${file.size}`));
  const merged = [...existing];
  const added: File[] = [];
  let typeError = false;
  let sizeError = false;
  let tooMany = false;

  for (const file of incoming) {
    const key = `${file.name}:${file.size}`;
    if (names.has(key)) continue;
    const classification = classifyUpload(file);
    if (classification === "type") {
      typeError = true;
      continue;
    }
    if (classification === "size") {
      sizeError = true;
      continue;
    }
    if (currentCount + added.length >= maxFiles) {
      tooMany = true;
      continue;
    }
    names.add(key);
    merged.push(file);
    added.push(file);
  }

  const error: UploadFileError | null = tooMany
    ? "tooManyFiles"
    : sizeError
      ? "fileTooLarge"
      : typeError
        ? "invalidFileType"
        : null;

  return { files: merged, added, error };
}

export async function prepareBulkInbox(
  files: File[],
  options?: { append?: boolean },
): Promise<DocumentEntity[]> {
  const accepted = files.filter(isAcceptedUpload);
  if (!options?.append) {
    clearEntityFiles();
  }

  const entities: DocumentEntity[] = [];
  for (const file of accepted) {
    const entity = await pendingEntityFromFile(file);
    entities.push(entity);
    setEntityFile(entity.id, file);
  }

  if (options?.append && getInboxQueue().length > 0) {
    appendInboxEntities(entities);
    return getInboxQueue();
  }

  setInboxQueue(entities);
  return entities;
}

async function pendingEntityFromFile(file: File): Promise<DocumentEntity> {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const isPdf = file.type === "application/pdf" || ext === ".pdf";
  const isImage =
    file.type.startsWith("image/") ||
    [".jpg", ".jpeg", ".png", ".webp", ".heic", ".gif"].includes(ext);
  const fileUrl = URL.createObjectURL(file);
  const pages = isPdf
    ? await pdfPages(id, file)
    : [
        {
          id: `${id}-p1`,
          label: "Page 1",
          kind: isImage ? "image" : "pdf",
          src: fileUrl,
        } satisfies DocumentPage,
      ];

  return {
    id,
    recipientName: "—",
    recipientEmail: "ops@carrier.example",
    fileName: file.name,
    originFileName: file.name,
    fileKind: isPdf ? "pdf" : isImage ? "image" : "pdf",
    fileUrl,
    thumbnailUrl: isImage ? fileUrl : undefined,
    pages: pages.length ? pages : [{ id: `${id}-p1`, label: "Page 1", kind: "pdf", src: fileUrl }],
    audit: null,
    reviewStatus: "pending",
    processingStatus: "queued",
    pageIndex: 1,
    pageCount: Math.max(pages.length, 1),
  };
}

async function pdfPages(id: string, file: File): Promise<DocumentPage[]> {
  try {
    const source = await PDFDocument.load(await file.arrayBuffer());
    const pageCount = source.getPageCount();
    const pages: DocumentPage[] = [];
    for (let index = 0; index < pageCount; index += 1) {
      const single = await PDFDocument.create();
      const [copied] = await single.copyPages(source, [index]);
      single.addPage(copied);
      const bytes = await single.save();
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      const blob = new Blob([copy], { type: "application/pdf" });
      pages.push({
        id: `${id}-p${index + 1}`,
        label: `Page ${index + 1}`,
        kind: "pdf",
        src: URL.createObjectURL(blob),
      });
    }
    return pages;
  } catch {
    return [
      {
        id: `${id}-p1`,
        label: "Page 1",
        kind: "pdf",
        src: URL.createObjectURL(file),
      },
    ];
  }
}
