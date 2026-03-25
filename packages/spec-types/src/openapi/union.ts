import type { Document as OpenAPIV2 } from './v2';
import type { Document as OpenAPIV3 } from './v3';
import type { Document as OpenAPIV3_1 } from './v3-1';

/**
 * Union of all supported OpenAPI document versions.
 */
export type Document = OpenAPIV2 | OpenAPIV3 | OpenAPIV3_1;
