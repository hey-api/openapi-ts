import type { IR } from '@hey-api/shared';

import type { MaybeTsDsl, TypeTsDsl } from '../../../../ts-dsl';

export type { HeyApiTypeScriptPlugin } from '../types';

/**
 * Metadata that flows through schema walking.
 */
export interface TypeScriptMeta {
  /** Default value from schema. */
  default?: unknown;
  /** Is this schema read-only? */
  readonly: boolean;
}

export interface TypeScriptEnumData {
  items: Array<{ key: string; schema: IR.SchemaObject }>;
  mode: 'javascript' | 'typescript' | 'typescript-const' | 'type';
}

/**
 * Result from walking a schema node.
 */
export interface TypeScriptResult {
  enumData?: TypeScriptEnumData;
  meta: TypeScriptMeta;
  type: MaybeTsDsl<TypeTsDsl>;
}

/**
 * Finalized result after applyModifiers.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TypeScriptFinal extends Pick<TypeScriptResult, 'enumData' | 'type'> {}
