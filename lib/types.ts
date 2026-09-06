export type RiskLevel = "compliant" | "action_needed" | "high_risk";
export type CheckStatus = "compliant" | "missing" | "unclear";
export type DocumentCategory = "cmr" | "pod" | "invoice" | "unknown";

export type ChecklistLabelKey =
  | "cmrConsignmentNote"
  | "cmrPartiesAndRoute"
  | "cmrGoodsAndWeight"
  | "podDeliveryConfirmation"
  | "podSignatureAndTimestamp"
  | "podConditionNotes"
  | "invoiceHeaderDetails"
  | "invoiceLineItemsMatch"
  | "invoiceVatAndPayment";

export type ChecklistCategoryKey =
  | "categoryCmr"
  | "categoryPod"
  | "categoryInvoice";

export interface VerificationCheckItem {
  id: string;
  labelKey: ChecklistLabelKey;
  categoryKey: ChecklistCategoryKey;
  status: CheckStatus;
  explanation: string;
}

export interface DocumentDetails {
  carrierName: string;
  shipper: string;
  consignee: string;
  vehiclePlate: string;
  cargoWeight: string;
  signaturePresent: boolean;
  stampPresent: boolean;
  documentDate: string;
  documentType: string;
  documentCategory: DocumentCategory;
  shipmentReference: string;
  riskLevel: RiskLevel;
}

export interface FollowUpEmail {
  subject: string;
  body: string;
}

export interface AuditResult {
  document: DocumentDetails;
  checklist: VerificationCheckItem[];
  discrepancies: string[];
  followUpEmail: FollowUpEmail;
  analyzedAt: string;
  sourceFile?: string;
}

export type ReviewStatus = "pending" | "approved" | "skipped";
export type DocumentFileKind = "pdf" | "image" | "mock";
export type ProcessingStatus = "queued" | "processing" | "ready" | "failed";
export type QueueVisualStatus = "processing" | "ok" | "discrepancy" | "failed" | "approved";

export interface DocumentPage {
  id: string;
  label: string;
  kind: DocumentFileKind;
  src?: string;
  mockVariant?: "cmr" | "pod" | "invoice";
}

export interface DocumentEntity {
  id: string;
  recipientName: string;
  recipientEmail: string;
  fileName: string;
  originFileName?: string;
  fileKind: DocumentFileKind;
  fileUrl?: string;
  thumbnailUrl?: string;
  pages: DocumentPage[];
  audit: AuditResult | null;
  reviewStatus: ReviewStatus;
  processingStatus: ProcessingStatus;
  pageIndex?: number;
  pageCount?: number;
  errorMessage?: string;
}

export interface SendEmailPayload {
  entityId: string;
  recipientEmail: string;
  recipientName: string;
  language: string;
  subject: string;
  body: string;
}

export interface SaveAuditStatusPayload {
  entityId: string;
  status: ReviewStatus;
  language: string;
  shipmentReference: string;
}
