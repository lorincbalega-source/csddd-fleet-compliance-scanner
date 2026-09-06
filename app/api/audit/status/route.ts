import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const statuses = new Map<
  string,
  { status: string; language: string; shipmentReference: string; savedAt: string }
>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entityId = typeof body.entityId === "string" ? body.entityId : "";
    const status = typeof body.status === "string" ? body.status : "";

    if (!entityId || !["pending", "approved", "skipped"].includes(status)) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const record = {
      status,
      language: typeof body.language === "string" ? body.language : "en",
      shipmentReference:
        typeof body.shipmentReference === "string" ? body.shipmentReference : "",
      savedAt: new Date().toISOString(),
    };

    statuses.set(entityId, record);

    return NextResponse.json({ ok: true, entityId, ...record });
  } catch {
    return NextResponse.json({ error: "STATUS_SAVE_FAILED" }, { status: 500 });
  }
}
