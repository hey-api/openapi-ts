import type { SchemaWithType } from '@hey-api/shared';

// TODO: move to shared
export function getPatternMessage(schema: SchemaWithType<'string'>): string | undefined {
  const message = schema['x-pattern-message'];
  if (typeof message !== 'string') return;
  return message;
}
