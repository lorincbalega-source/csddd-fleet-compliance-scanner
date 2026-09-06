import { PDFDocument } from "pdf-lib";
import type { DocumentEntity, DocumentPage } from "./types";
import { setEntityFile, setInboxQueue, clearEntityFiles } from "./inbox-store";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function isAcceptedUpload(file: File): boolean {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const isImage = file.type.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp", ".heic", ".gif"].includes(ext);
  const isPdf = file.type === "application/pdf" || ext === ".pdf";
  const isDocx =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx";
  return (isImage || isPdf || isDocx) && file.size > 0 && file.size <= MAX_FILE_SIZE;
}

export async function prepareBulkInbox(files: File[]): Promise<DocumentEntity[]> {
  clearEntityFiles();
  const accepted = files.filter(isAcceptedUpload);
  const entities: DocumentEntity[] = [];

  for (const file of accepted) {
    const parts = await expandFileToParts(file);
    for (const part of parts) {
      const entity = pendingEntityFromPart(part);
      entities.push(entity);
      setEntityFile(entity.id, part.file);
    }
  }

  setInboxQueue(entities);
  return entities;
}

interface FilePart {
  file: File;
  originFileName: string;
  pageIndex: number;
  pageCount: number;
  thumbnailUrl?: string;
  fileKind: DocumentEntity["fileKind"];
}

async function expandFileToParts(file: File): Promise<FilePart[]> {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const isPdf = file.type === "application/pdf" || ext === ".pdf";
  const isImage = file.type.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp", ".heic", ".gif"].includes(ext);

  if (isImage) {
    const thumbnailUrl = URL.createObjectURL(file);
    return [
      {
        file,
        originFileName: file.name,
        pageIndex: 1,
        pageCount: 1,
        thumbnailUrl,
        fileKind: "image",
      },
    ];
  }

  if (!isPdf) {
    return [
      {
        file,
        originFileName: file.name,
        pageIndex: 1,
        pageCount: 1,
        fileKind: "pdf",
      },
    ];
  }

  try {
    const source = await PDFDocument.load(await file.arrayBuffer());
    const pageCount = source.getPageCount();
    if (pageCount <= 1) {
      return [
        {
          file,
          originFileName: file.name,
          pageIndex: 1,
          pageCount: 1,
          fileKind: "pdf",
        },
      ];
    }

    const parts: FilePart[] = [];
    const baseName = file.name.replace(/\.pdf$/i, "");
    for (let index = 0; index < pageCount; index += 1) {
      const single = await PDFDocument.create();
      const [copied] = await single.copyPages(source, [index]);
      single.addPage(copied);
      const bytes = await single.save();
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      const pageFile = new File([copy], `${baseName}_p${index + 1}.pdf`, {
        type: "application/pdf",
      });
      parts.push({
        file: pageFile,
        originFileName: file.name,
        pageIndex: index + 1,
        pageCount,
        fileKind: "pdf",
      });
    }
    return parts;
  } catch {
    return [
      {
        file,
        originFileName: file.name,
        pageIndex: 1,
        pageCount: 1,
        fileKind: "pdf",
      },
    ];
  }
}

function pendingEntityFromPart(part: FilePart): DocumentEntity {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const fileUrl = URL.createObjectURL(part.file);
  const pages: DocumentPage[] =
    part.fileKind === "image"
      ? [{ id: `${id}-p1`, label: "Page 1", kind: "image", src: part.thumbnailUrl ?? fileUrl }]
      : [{ id: `${id}-pdf`, label: `Page ${part.pageIndex}`, kind: "pdf", src: fileUrl }];

  return {
    id,
    recipientName: "—",
    recipientEmail: "ops@carrier.example",
    fileName: part.file.name,
    originFileName: part.originFileName,
    fileKind: part.fileKind,
    fileUrl,
    thumbnailUrl: part.thumbnailUrl,
    pages,
    audit: null,
    reviewStatus: "pending",
    processingStatus: "queued",
    pageIndex: part.pageIndex,
    pageCount: part.pageCount,
  };
}
