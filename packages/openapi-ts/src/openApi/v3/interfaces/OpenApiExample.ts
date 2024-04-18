import type { OpenApiReference } from './OpenApiReference';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#example-object
 */
export interface OpenApiExample extends OpenApiReference {
  summary?: string;
  description?: string;
  value?: unknown;
  externalValue?: string;
}
