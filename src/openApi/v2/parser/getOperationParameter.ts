import type { OperationParameter } from '../../../types/client';
import { getEnums } from '../../../utils/getEnums';
import { getPattern } from '../../../utils/getPattern';
import { getRef } from '../../common/parser/getRef';
import { getOperationParameterName } from '../../common/parser/operation';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiParameter } from '../interfaces/OpenApiParameter';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getModel } from './getModel';
import { getOperationParameterDefault } from './getOperationParameterDefault';

export const getOperationParameter = (openApi: OpenApi, parameter: OpenApiParameter): OperationParameter => {
    const operationParameter: OperationParameter = {
        $refs: [],
        base: 'any',
        description: parameter.description || null,
        enum: [],
        enums: [],
        exclusiveMaximum: parameter.exclusiveMaximum,
        exclusiveMinimum: parameter.exclusiveMinimum,
        export: 'interface',
        format: parameter.format,
        imports: [],
        in: parameter.in,
        isDefinition: false,
        isNullable: parameter['x-nullable'] === true,
        isReadOnly: false,
        isRequired: parameter.required === true,
        link: null,
        maximum: parameter.maximum,
        maxItems: parameter.maxItems,
        maxLength: parameter.maxLength,
        mediaType: null,
        minimum: parameter.minimum,
        minItems: parameter.minItems,
        minLength: parameter.minLength,
        multipleOf: parameter.multipleOf,
        name: getOperationParameterName(parameter.name),
        pattern: getPattern(parameter.pattern),
        prop: parameter.name,
        properties: [],
        template: null,
        type: 'any',
        uniqueItems: parameter.uniqueItems,
    };

    if (parameter.$ref) {
        const definitionRef = getType(parameter.$ref);
        operationParameter.export = 'reference';
        operationParameter.type = definitionRef.type;
        operationParameter.base = definitionRef.base;
        operationParameter.template = definitionRef.template;
        operationParameter.imports.push(...definitionRef.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }

    if (parameter.enum) {
        const enums = getEnums(parameter, parameter.enum);
        if (enums.length) {
            operationParameter.base = 'string';
            operationParameter.enum.push(...enums);
            operationParameter.export = 'enum';
            operationParameter.type = 'string';
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        }
    }

    if (parameter.type === 'array' && parameter.items) {
        const items = getType(parameter.items.type, parameter.items.format);
        operationParameter.export = 'array';
        operationParameter.type = items.type;
        operationParameter.base = items.base;
        operationParameter.template = items.template;
        operationParameter.imports.push(...items.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }

    if (parameter.type === 'object' && parameter.items) {
        const items = getType(parameter.items.type, parameter.items.format);
        operationParameter.export = 'dictionary';
        operationParameter.type = items.type;
        operationParameter.base = items.base;
        operationParameter.template = items.template;
        operationParameter.imports.push(...items.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }

    let schema = parameter.schema;
    if (schema) {
        if (schema.$ref?.startsWith('#/parameters/')) {
            schema = getRef<OpenApiSchema>(openApi, schema);
        }
        if (schema.$ref) {
            const model = getType(schema.$ref);
            operationParameter.export = 'reference';
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.imports.push(...model.imports);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        } else {
            const model = getModel(openApi, schema);
            operationParameter.export = model.export;
            operationParameter.type = model.type;
            operationParameter.base = model.base;
            operationParameter.template = model.template;
            operationParameter.link = model.link;
            operationParameter.imports.push(...model.imports);
            operationParameter.enum.push(...model.enum);
            operationParameter.enums.push(...model.enums);
            operationParameter.properties.push(...model.properties);
            operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
            return operationParameter;
        }
    }

    // If the parameter has a type than it can be a basic or generic type.
    if (parameter.type) {
        const definitionType = getType(parameter.type, parameter.format);
        operationParameter.export = 'generic';
        operationParameter.type = definitionType.type;
        operationParameter.base = definitionType.base;
        operationParameter.template = definitionType.template;
        operationParameter.imports.push(...definitionType.imports);
        operationParameter.default = getOperationParameterDefault(parameter, operationParameter);
        return operationParameter;
    }

    return operationParameter;
};
