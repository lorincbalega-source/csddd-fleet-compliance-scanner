import type { DocumentEntity } from "./types";

export type InboxListener = (queue: DocumentEntity[]) => void;

let queue: DocumentEntity[] = [];
const listeners = new Set<InboxListener>();
const filesById = new Map<string, File>();

function notify(): void {
  const snapshot = queue;
  for (const listener of listeners) {
    listener(snapshot);
  }
}

export function subscribeInbox(listener: InboxListener): () => void {
  listeners.add(listener);
  listener(queue);
  return () => {
    listeners.delete(listener);
  };
}

export function setInboxQueue(entities: DocumentEntity[]): void {
  queue = entities;
  notify();
}

export function appendInboxEntities(entities: DocumentEntity[]): void {
  if (!entities.length) return;
  queue = [...queue, ...entities];
  notify();
}

export function getInboxQueue(): DocumentEntity[] {
  return queue;
}

export function hasInboxQueue(): boolean {
  return queue.length > 0;
}

export function patchInboxEntity(id: string, patch: Partial<DocumentEntity>): void {
  queue = queue.map((entity) => (entity.id === id ? { ...entity, ...patch } : entity));
  notify();
}

export function setEntityFile(id: string, file: File): void {
  filesById.set(id, file);
}

export function getEntityFile(id: string): File | undefined {
  return filesById.get(id);
}

export function clearEntityFiles(): void {
  filesById.clear();
}
