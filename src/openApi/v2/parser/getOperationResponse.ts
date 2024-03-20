import type { OperationResponse } from '../../../types/client';
import { getPattern } from '../../../utils/getPattern';
import { getType } from '../../../utils/type';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiResponse } from '../interfaces/OpenApiResponse';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getModel } from './getModel';
import { getRef } from './getRef';

export const getOperationResponse = (
    openApi: OpenApi,
    response: OpenApiResponse,
    responseCode: number
): OperationResponse => {
    const operationResponse: OperationResponse = {
        $refs: [],
        base: responseCode !== 204 ? 'any' : 'void',
        code: responseCode,
        description: response.description || null,
        enum: [],
        enums: [],
        export: 'generic',
        imports: [],
        in: 'response',
        isDefinition: false,
        isNullable: false,
        isReadOnly: false,
        isRequired: false,
        link: null,
        name: '',
        properties: [],
        template: null,
        type: responseCode !== 204 ? 'any' : 'void',
    };

    // If this response has a schema, then we need to check two things:
    // if this is a reference then the parameter is just the 'name' of
    // this reference type. Otherwise, it might be a complex schema,
    // and then we need to parse the schema!
    let schema = response.schema;
    if (schema) {
        if (schema.$ref?.startsWith('#/responses/')) {
            schema = getRef<OpenApiSchema>(openApi, schema);
        }
        if (schema.$ref) {
            const model = getType(schema.$ref);
            operationResponse.export = 'reference';
            operationResponse.type = model.type;
            operationResponse.base = model.base;
            operationResponse.template = model.template;
            operationResponse.imports.push(...model.imports);
            return operationResponse;
        } else {
            const model = getModel(openApi, schema);
            operationResponse.export = model.export;
            operationResponse.type = model.type;
            operationResponse.base = model.base;
            operationResponse.template = model.template;
            operationResponse.link = model.link;
            operationResponse.isReadOnly = model.isReadOnly;
            operationResponse.isRequired = model.isRequired;
            operationResponse.isNullable = model.isNullable;
            operationResponse.format = model.format;
            operationResponse.maximum = model.maximum;
            operationResponse.exclusiveMaximum = model.exclusiveMaximum;
            operationResponse.minimum = model.minimum;
            operationResponse.exclusiveMinimum = model.exclusiveMinimum;
            operationResponse.multipleOf = model.multipleOf;
            operationResponse.maxLength = model.maxLength;
            operationResponse.minLength = model.minLength;
            operationResponse.maxItems = model.maxItems;
            operationResponse.minItems = model.minItems;
            operationResponse.uniqueItems = model.uniqueItems;
            operationResponse.maxProperties = model.maxProperties;
            operationResponse.minProperties = model.minProperties;
            operationResponse.pattern = getPattern(model.pattern);
            operationResponse.imports.push(...model.imports);
            operationResponse.enum.push(...model.enum);
            operationResponse.enums.push(...model.enums);
            operationResponse.properties.push(...model.properties);
            return operationResponse;
        }
    }

    // We support basic properties from response headers, since both
    // fetch and XHR client just support string types.
    if (response.headers) {
        for (const name in response.headers) {
            if (response.headers.hasOwnProperty(name)) {
                operationResponse.in = 'header';
                operationResponse.name = name;
                operationResponse.type = 'string';
                operationResponse.base = 'string';
                return operationResponse;
            }
        }
    }

    return operationResponse;
};
