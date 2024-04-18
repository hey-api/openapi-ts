import type { Dictionary } from '../../common/interfaces/Dictionary'
import type { OpenApiMediaType } from './OpenApiMediaType'
import type { OpenApiReference } from './OpenApiReference'

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#request-body-object
 */
export interface OpenApiRequestBody extends OpenApiReference {
  'x-body-name'?: string
  content: Dictionary<OpenApiMediaType>
  description?: string
  nullable?: boolean
  required?: boolean
}
