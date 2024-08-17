import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiHeader } from './OpenApiHeader';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#encoding-object
 */
export interface OpenApiEncoding {
  allowReserved?: boolean;
  contentType?: string;
  explode?: boolean;
  headers?: Dictionary<OpenApiHeader>;
  style?: string;
}
