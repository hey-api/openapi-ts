import type { OpenApiReference } from './OpenApiReference';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#example-object
 */
export interface OpenApiExample extends OpenApiReference {
  description?: string;
  externalValue?: string;
  summary?: string;
  value?: unknown;
}
