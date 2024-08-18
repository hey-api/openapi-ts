import type { Dictionary } from '../../common/interfaces/Dictionary';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#discriminator-object
 */
export interface OpenApiDiscriminator {
  mapping?: Dictionary<string>;
  propertyName: string;
}
