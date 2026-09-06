"use client";

import { useMemo } from "react";
import { getTranslations } from "@/lib/translations";
import { cloneSampleQueue } from "@/lib/document-entities";
import { getInboxQueue, hasInboxQueue, setInboxQueue } from "@/lib/inbox-store";
import { DocumentSlideDeck } from "@/components/crm/DocumentSlideDeck";

export default function InboxPage() {
  const t = getTranslations("en");
  const queue = useMemo(() => {
    if (hasInboxQueue()) return getInboxQueue();
    const sample = cloneSampleQueue();
    setInboxQueue(sample);
    return sample;
  }, []);

  return <DocumentSlideDeck initialQueue={queue} t={t} />;
}
