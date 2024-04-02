import type { Model } from '../../common/interfaces/client';
import type { OpenApiParameter } from '../../v2/interfaces/OpenApiParameter';
import type { OpenApiSchema } from '../../v3/interfaces/OpenApiSchema';
import type { OperationParameter } from '../interfaces/client';

export const getDefault = (
    definition: OpenApiSchema | OpenApiParameter,
    model?: Model | OperationParameter
): string | undefined => {
    if (definition.default === undefined) {
        return undefined;
    }

    if (definition.default === null) {
        return 'null';
    }

    const type = definition.type || typeof definition.default;

    switch (type) {
        case 'int':
        case 'integer':
        case 'number':
            if (model?.export === 'enum' && model.enum?.[definition.default as number]) {
                const { value } = model.enum[definition.default as number];
                return typeof value === 'string' ? `'${value}'` : String(value);
            }
            return String(definition.default);
        case 'string':
            return `'${definition.default}'`;
        case 'array':
        case 'boolean':
        case 'object':
            try {
                return JSON.stringify(definition.default, null, 4);
            } catch (e) {
                // Ignore
            }
    }
    return undefined;
};
