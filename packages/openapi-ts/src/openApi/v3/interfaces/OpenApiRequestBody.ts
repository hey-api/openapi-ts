import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiMediaType } from './OpenApiMediaType';
import type { OpenApiReference } from './OpenApiReference';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#request-body-object
 */
export interface OpenApiRequestBody extends OpenApiReference {
  content: Dictionary<OpenApiMediaType>;
  description?: string;
  nullable?: boolean;
  required?: boolean;
  'x-body-name'?: string;
}
