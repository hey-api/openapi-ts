import type { OperationParameter } from '../../../types/client';
import type { OpenApiParameter } from '../interfaces/OpenApiParameter';

export const getOperationParameterDefault = (
    parameter: OpenApiParameter,
    operationParameter: OperationParameter
): string | undefined => {
    if (parameter.default === undefined) {
        return undefined;
    }

    if (parameter.default === null) {
        return 'null';
    }

    const type = parameter.type || typeof parameter.default;

    switch (type) {
        case 'int':
        case 'integer':
        case 'number':
            if (operationParameter.export === 'enum' && operationParameter.enum?.[parameter.default]) {
                const { value } = operationParameter.enum[parameter.default];
                return typeof value === 'string' ? `'${value}'` : String(value);
            }
            return String(parameter.default);

        case 'boolean':
            return JSON.stringify(parameter.default);

        case 'string':
            return `'${parameter.default}'`;

        case 'object':
            try {
                return JSON.stringify(parameter.default, null, 4);
            } catch (e) {
                // Ignore
            }
    }

    return undefined;
};
