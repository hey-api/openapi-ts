import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiHeader } from './OpenApiHeader';
import type { OpenApiLink } from './OpenApiLink';
import type { OpenApiMediaType } from './OpenApiMediaType';
import type { OpenApiReference } from './OpenApiReference';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#response-object
 */
export interface OpenApiResponse extends OpenApiReference {
  description: string;
  headers?: Dictionary<OpenApiHeader>;
  content?: Dictionary<OpenApiMediaType>;
  links?: Dictionary<OpenApiLink>;
}
