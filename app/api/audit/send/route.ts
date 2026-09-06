import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.body === "string" ? body.body.trim() : "";
    const entityId = typeof body.entityId === "string" ? body.entityId : "";
    const recipientEmail =
      typeof body.recipientEmail === "string" ? body.recipientEmail.trim() : "";

    if (!entityId || !subject || !message || !recipientEmail) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 420));

    return NextResponse.json({
      ok: true,
      messageId: `dockify_${entityId}_${Date.now()}`,
      sentAt: new Date().toISOString(),
      recipientEmail,
      language: typeof body.language === "string" ? body.language : "en",
    });
  } catch {
    return NextResponse.json({ error: "SEND_FAILED" }, { status: 500 });
  }
}
