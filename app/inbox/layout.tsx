"use client";

import { PasswordGate } from "@/components/PasswordGate";

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return <PasswordGate>{children}</PasswordGate>;
}
