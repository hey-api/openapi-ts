import type { OpenApiContact } from './OpenApiContact'
import type { OpenApiLicense } from './OpenApiLicense'

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#info-object
 */
export interface OpenApiInfo {
  title: string
  description?: string
  termsOfService?: string
  contact?: OpenApiContact
  license?: OpenApiLicense
  version: string
}
