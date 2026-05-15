import type { CodegenInput, CodegenOutput } from './codegen-url';

type PreviewTabKey<L extends CodegenOutput> = `preview:${L}:tab`;

export type SyncRegistry = {
  [K in PreviewTabKey<CodegenOutput>]: number;
} & {
  'toggle:codegen-input': CodegenInput;
  'toggle:codegen-output': CodegenOutput;
};

export type SyncKey = keyof SyncRegistry;

const registry: { [K in SyncKey]: { parse: (raw: string) => SyncRegistry[K] } } = {
  'preview:python:tab': { parse: Number },
  'preview:typescript:tab': { parse: Number },
  'toggle:codegen-input': { parse: (v) => v as CodegenInput },
  'toggle:codegen-output': { parse: (v) => v as CodegenOutput },
};

export const SYNC_CUSTOM_EVENT = 'hey-api-sync';
export const SYNC_STORAGE_PREFIX = 'hey-api__';

export function getSynced<K extends SyncKey>(key: K): SyncRegistry[K] | null {
  try {
    const raw = localStorage.getItem(SYNC_STORAGE_PREFIX + key);
    return raw !== null ? registry[key].parse(raw) : null;
  } catch {
    // localStorage unavailable (SSR guard, private browsing restrictions, etc.)
    return null;
  }
}

export type SyncEventDetail<K extends SyncKey = SyncKey> = {
  key: K;
  value: SyncRegistry[K];
};

export function setSynced<K extends SyncKey>(key: K, value: SyncRegistry[K]): void {
  localStorage.setItem(SYNC_STORAGE_PREFIX + key, String(value));
  window.dispatchEvent(new CustomEvent(SYNC_CUSTOM_EVENT, { detail: { key, value } }));
}

export function onSynced<K extends SyncKey>(
  key: K,
  callback: (value: SyncRegistry[K]) => void,
): () => void {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<SyncEventDetail<K>>).detail;
    if (detail.key === key) callback(detail.value as SyncRegistry[K]);
  };
  window.addEventListener(SYNC_CUSTOM_EVENT, handler);
  return () => window.removeEventListener(SYNC_CUSTOM_EVENT, handler);
}
