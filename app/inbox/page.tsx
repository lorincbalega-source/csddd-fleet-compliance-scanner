"use client";

import { useMemo } from "react";
import { getTranslations } from "@/lib/translations";
import { cloneSampleQueue } from "@/lib/document-entities";
import { getInboxQueue, hasInboxQueue } from "@/lib/inbox-store";
import { DocumentSlideDeck } from "@/components/crm/DocumentSlideDeck";

export default function InboxPage() {
  const t = getTranslations("en");
  const queue = useMemo(
    () => (hasInboxQueue() ? getInboxQueue() : cloneSampleQueue()),
    [],
  );

  return <DocumentSlideDeck initialQueue={queue} t={t} />;
}
