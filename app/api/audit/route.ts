/**
 * POST /api/audit — server-only Dockify Document Auditor endpoint.
 * Uses GPT-4o with DOCKIFY_SYSTEM_PROMPT (lib/openai.ts). API key never reaches the client.
 */
import { NextRequest, NextResponse } from "next/server";
import { runAudit } from "@/lib/audit-service";

/** Ensure this route always runs on the Node.js server (never in the browser). */
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = await request.json();

      if (body.useMock) {
        const result = await runAudit({ useMock: true });
        return NextResponse.json(result);
      }

      return NextResponse.json(
        {
          error:
            "Invalid request. Send multipart/form-data with a file or { useMock: true }.",
        },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const useMock = formData.get("useMock") === "true";

    if (useMock) {
      const result = await runAudit({ useMock: true });
      return NextResponse.json(result);
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
    }

    const result = await runAudit({ file });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AUDIT_FAILED";

    if (message === "OPENAI_API_KEY_MISSING") {
      return NextResponse.json(
        { error: "OPENAI_API_KEY_MISSING" },
        { status: 500 },
      );
    }

    if (
      message === "OPENAI_EMPTY_RESPONSE" ||
      message === "OPENAI_INVALID_JSON" ||
      message.includes("OpenAI") ||
      message.includes("openai")
    ) {
      console.error("[/api/audit] OpenAI error:", message);
      return NextResponse.json({ error: "OPENAI_AUDIT_FAILED" }, { status: 502 });
    }

    const statusMap: Record<string, number> = {
      NO_FILE: 400,
      INVALID_FILE_TYPE: 400,
      FILE_TOO_LARGE: 400,
    };

    return NextResponse.json(
      { error: message },
      { status: statusMap[message] ?? 500 },
    );
  }
}
