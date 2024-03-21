import type { OperationParameters } from '../../../types/client';
import { getRef } from '../../common/parser/getRef';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { getOperationParameter } from './getOperationParameter';

const allowedIn = ['cookie', 'formData', 'header', 'path', 'query'] as const;

export const getOperationParameters = (openApi: OpenApi, parameters: OpenApiParameter[]): OperationParameters => {
    const operationParameters: OperationParameters = {
        $refs: [],
        imports: [],
        parameters: [],
        parametersPath: [],
        parametersQuery: [],
        parametersForm: [],
        parametersCookie: [],
        parametersHeader: [],
        parametersBody: null, // Not used in v3 -> @see requestBody
    };

    parameters.forEach(parameterOrReference => {
        const parameterDef = getRef<OpenApiParameter>(openApi, parameterOrReference);
        const parameter = getOperationParameter(openApi, parameterDef);

        const defIn = parameterDef.in as (typeof allowedIn)[number];

        // ignore the "api-version" param since we do not want to add it
        // as the first/default parameter for each of the service calls
        if (parameter.prop === 'api-version' || !allowedIn.includes(defIn)) {
            return;
        }

        switch (defIn) {
            case 'cookie':
                operationParameters.parametersCookie = [...operationParameters.parametersCookie, parameter];
                break;
            case 'formData':
                operationParameters.parametersForm = [...operationParameters.parametersForm, parameter];
                break;
            case 'header':
                operationParameters.parametersHeader = [...operationParameters.parametersHeader, parameter];
                break;
            case 'path':
                operationParameters.parametersPath = [...operationParameters.parametersPath, parameter];
                break;
            case 'query':
                operationParameters.parametersQuery = [...operationParameters.parametersQuery, parameter];
                break;
        }

        operationParameters.$refs = [...operationParameters.$refs, ...parameter.$refs];
        operationParameters.imports = [...operationParameters.imports, ...parameter.imports];
        operationParameters.parameters = [...operationParameters.parameters, parameter];
    });

    return operationParameters;
};
