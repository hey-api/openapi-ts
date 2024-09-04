import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiServerVariable } from './OpenApiServerVariable';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#server-object
 */
export interface OpenApiServer {
  description?: string;
  url: string;
  variables?: Dictionary<OpenApiServerVariable>;
}
