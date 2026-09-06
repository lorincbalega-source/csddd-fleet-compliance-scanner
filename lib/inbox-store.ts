import type { DocumentEntity } from "./types";

let queue: DocumentEntity[] = [];

export function setInboxQueue(entities: DocumentEntity[]): void {
  queue = entities;
}

export function getInboxQueue(): DocumentEntity[] {
  return queue;
}

export function hasInboxQueue(): boolean {
  return queue.length > 0;
}
