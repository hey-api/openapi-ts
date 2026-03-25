import type { Document as JSONSchemaDraft4 } from './draft-4';
import type { Document as JSONSchemaDraft2020_12 } from './draft-2020-12';

/**
 * Union of all supported JSON Schema document versions.
 */
export type Document = JSONSchemaDraft4 | JSONSchemaDraft2020_12;
