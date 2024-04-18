import type { Dictionary } from '../../common/interfaces/Dictionary'
import type { OpenApiReference } from './OpenApiReference'
import type { OpenApiServer } from './OpenApiServer'

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#link-object
 */
export interface OpenApiLink extends OpenApiReference {
  operationRef?: string
  operationId?: string
  parameters?: Dictionary<unknown>
  requestBody?: unknown
  description?: string
  server?: OpenApiServer
}
