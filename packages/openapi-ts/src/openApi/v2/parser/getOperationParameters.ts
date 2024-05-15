import type { Client } from '../../../types/client';
import type { OperationParameters } from '../../common/interfaces/client';
import { getRef } from '../../common/parser/getRef';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { getOperationParameter } from './getOperationParameter';

export const getOperationParameters = ({
  openApi,
  parameters,
  types,
}: {
  openApi: OpenApi;
  parameters: OpenApiParameter[];
  types: Client['types'];
}): OperationParameters => {
  const operationParameters: OperationParameters = {
    $refs: [],
    imports: [],
    parameters: [],
    parametersBody: null,
    parametersCookie: [],
    parametersForm: [],
    parametersHeader: [],
    parametersPath: [],
    parametersQuery: [],
  };

  // Iterate over the parameters
  parameters.forEach((parameterOrReference) => {
    const parameterDef = getRef<OpenApiParameter>(
      openApi,
      parameterOrReference,
    );
    const parameter = getOperationParameter({
      openApi,
      parameter: parameterDef,
      types,
    });

    // We ignore the "api-version" param, since we do not want to add this
    // as the first / default parameter for each of the service calls.
    if (parameter.prop !== 'api-version') {
      switch (parameter.in) {
        case 'path':
          operationParameters.parametersPath.push(parameter);
          operationParameters.parameters.push(parameter);
          operationParameters.imports.push(...parameter.imports);
          break;

        case 'query':
          operationParameters.parametersQuery.push(parameter);
          operationParameters.parameters.push(parameter);
          operationParameters.imports.push(...parameter.imports);
          break;

        case 'header':
          operationParameters.parametersHeader.push(parameter);
          operationParameters.parameters.push(parameter);
          operationParameters.imports.push(...parameter.imports);
          break;

        case 'formData':
          operationParameters.parametersForm.push(parameter);
          operationParameters.parameters.push(parameter);
          operationParameters.imports.push(...parameter.imports);
          break;

        case 'body':
          operationParameters.parametersBody = parameter;
          operationParameters.parameters.push(parameter);
          operationParameters.imports.push(...parameter.imports);
          break;
      }
    }
  });
  return operationParameters;
};
