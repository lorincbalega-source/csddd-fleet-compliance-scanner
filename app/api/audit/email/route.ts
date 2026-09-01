import { NextRequest, NextResponse } from "next/server";
import { runFollowUpEmail } from "@/lib/audit-service";
import type { DocumentDetails, VerificationCheckItem } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const recipientLanguage =
      typeof body.recipientLanguage === "string" ? body.recipientLanguage : "en";

    if (!body.document || typeof body.document !== "object") {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const discrepancies = Array.isArray(body.discrepancies)
      ? body.discrepancies.filter((item: unknown): item is string => typeof item === "string")
      : [];
    const checklist = Array.isArray(body.checklist) ? body.checklist : [];

    const email = await runFollowUpEmail({
      recipientLanguage,
      document: body.document as DocumentDetails,
      discrepancies,
      checklist: checklist as VerificationCheckItem[],
      sourceFile: typeof body.sourceFile === "string" ? body.sourceFile : undefined,
    });

    return NextResponse.json(email);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AUDIT_FAILED";

    if (message === "OPENAI_API_KEY_MISSING") {
      return NextResponse.json({ error: "OPENAI_API_KEY_MISSING" }, { status: 500 });
    }

    console.error("[/api/audit/email] OpenAI error:", message);
    return NextResponse.json({ error: "OPENAI_AUDIT_FAILED" }, { status: 502 });
  }
}
