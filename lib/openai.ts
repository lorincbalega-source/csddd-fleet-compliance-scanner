import OpenAI from "openai";
import { DOCKIFY_AUDIT_SYSTEM_PROMPT } from "./audit-prompt";

/**
 * Strict system prompt used for every GPT-4o audit call.
 * Identity: Dockify Document Auditor — extract/verify shipper, consignee,
 * vehicle plate, cargo weight, and signature/stamp; return structured JSON.
 */
export const DOCKIFY_SYSTEM_PROMPT = DOCKIFY_AUDIT_SYSTEM_PROMPT;

/**
 * Server-side OpenAI client. Uses OPENAI_API_KEY from the environment.
 * Never import this module from client components — the key must stay on the server.
 */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY_MISSING");
  }

  return new OpenAI({ apiKey });
}
