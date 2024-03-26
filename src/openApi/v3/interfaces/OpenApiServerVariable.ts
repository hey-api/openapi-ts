import type { WithEnumExtension } from '../../../types/client';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#server-variable-object
 */
export interface OpenApiServerVariable extends WithEnumExtension {
    enum?: (string | number)[];
    default: string;
    description?: string;
}
