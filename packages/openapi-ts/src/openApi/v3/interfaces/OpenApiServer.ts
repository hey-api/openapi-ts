import type { Dictionary } from '../../common/interfaces/Dictionary'
import type { OpenApiServerVariable } from './OpenApiServerVariable'

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#server-object
 */
export interface OpenApiServer {
  url: string
  description?: string
  variables?: Dictionary<OpenApiServerVariable>
}
