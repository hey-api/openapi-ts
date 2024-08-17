import type { Dictionary } from '../../common/interfaces/Dictionary';
import type { OpenApiReference } from './OpenApiReference';
import type { OpenApiServer } from './OpenApiServer';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#link-object
 */
export interface OpenApiLink extends OpenApiReference {
  description?: string;
  operationId?: string;
  operationRef?: string;
  parameters?: Dictionary<unknown>;
  requestBody?: unknown;
  server?: OpenApiServer;
}
