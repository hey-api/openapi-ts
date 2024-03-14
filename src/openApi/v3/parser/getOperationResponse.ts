import type { OperationResponse } from '../../../client/interfaces/OperationResponse';
import { getPattern } from '../../../utils/getPattern';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiResponse } from '../interfaces/OpenApiResponse';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getContent } from './getContent';
import { getModel } from './getModel';
import { getRef } from './getRef';
import { getType } from './getType';

const getOperationResponseModel = (response: OpenApiResponse, responseCode: number) => {
    const operationResponse: OperationResponse = {
        in: 'response',
        name: '',
        code: responseCode,
        description: response.description || null,
        export: 'generic',
        type: responseCode !== 204 ? 'any' : 'void',
        base: responseCode !== 204 ? 'any' : 'void',
        template: null,
        link: null,
        isDefinition: false,
        isReadOnly: false,
        isRequired: false,
        isNullable: false,
        imports: [],
        enum: [],
        enums: [],
        properties: [],
    };
    return operationResponse;
};

export const getOperationResponse = (
    openApi: OpenApi,
    response: OpenApiResponse,
    responseCode: number
): OperationResponse[] => {
    const operationResponses: OperationResponse[] = [];

    if (response.content) {
        const content = getContent(openApi, response.content);
        if (content) {
            if (content.schema.$ref?.startsWith('#/components/responses/')) {
                content.schema = getRef<OpenApiSchema>(openApi, content.schema);
            }
            if (content.schema.$ref) {
                const operationResponse = getOperationResponseModel(response, responseCode);
                const model = getType(content.schema.$ref);
                operationResponse.export = 'reference';
                operationResponse.type = model.type;
                operationResponse.base = model.base;
                operationResponse.template = model.template;
                operationResponse.imports.push(...model.imports);
                operationResponses.push(operationResponse);
            } else {
                const operationResponse = getOperationResponseModel(response, responseCode);
                const model = getModel(openApi, content.schema);
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
                operationResponses.push(operationResponse);
            }
        }
    }

    // We support basic properties from response headers, since both
    // fetch and XHR client just support string types.
    if (response.headers) {
        for (const name in response.headers) {
            if (response.headers.hasOwnProperty(name)) {
                const operationResponse = getOperationResponseModel(response, responseCode);
                operationResponse.in = 'header';
                operationResponse.name = name;
                operationResponse.type = 'string';
                operationResponse.base = 'string';
                operationResponses.push(operationResponse);
            }
        }
    }

    if (!operationResponses.length) {
        const operationResponse = getOperationResponseModel(response, responseCode);
        operationResponses.push(operationResponse);
    }

    return operationResponses;
};
