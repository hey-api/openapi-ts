import type { Model } from '../../common/interfaces/client';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';

export const getModelDefault = (definition: OpenApiSchema, model?: Model): string | undefined => {
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
            if (model?.export === 'enum' && model.enum?.[definition.default]) {
                const { value } = model.enum[definition.default];
                return typeof value === 'string' ? `'${value}'` : String(value);
            }
            return String(definition.default);

        case 'boolean':
            return JSON.stringify(definition.default);

        case 'string':
            return `'${definition.default}'`;

        case 'object':
            try {
                return JSON.stringify(definition.default, null, 4);
            } catch (e) {
                // Ignore
            }
    }

    return undefined;
};
