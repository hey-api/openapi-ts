import type { OpenApiPath } from './OpenApiPath'
import type { OpenApiReference } from './OpenApiReference'

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#callback-object
 */
interface Callback {
  [key: string]: OpenApiPath
}

export type OpenApiCallback = OpenApiReference & Callback
