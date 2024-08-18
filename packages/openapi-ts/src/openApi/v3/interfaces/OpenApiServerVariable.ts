import type { WithEnumExtension } from '../../common/interfaces/WithEnumExtension';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#server-variable-object
 */
export interface OpenApiServerVariable extends WithEnumExtension {
  default: string;
  description?: string;
  enum?: (string | number)[];
}
