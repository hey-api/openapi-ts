import type { Dictionary } from '../../common/interfaces/Dictionary'

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#discriminator-object
 */
export interface OpenApiDiscriminator {
  propertyName: string
  mapping?: Dictionary<string>
}
