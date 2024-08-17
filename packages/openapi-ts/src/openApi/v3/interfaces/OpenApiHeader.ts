import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiExample } from './OpenApiExample';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiSchema } from './OpenApiSchema';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#header-object
 */
export interface OpenApiHeader extends OpenApiReference {
  allowEmptyValue?: boolean;
  allowReserved?: boolean;
  deprecated?: boolean;
  description?: string;
  example?: unknown;
  examples?: Dictionary<OpenApiExample>;
  explode?: boolean;
  required?: boolean;
  schema?: OpenApiSchema;
  style?: string;
}
