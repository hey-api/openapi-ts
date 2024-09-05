import type { Client } from '../../../../types/client';
import type { OperationParameters } from '../../common/interfaces/client';
import type { Config } from '../../common/interfaces/config';
import { getRef } from '../../common/parser/getRef';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiParameter } from '../interfaces/OpenApiParameter';
import { getOperationParameter } from './getOperationParameter';

const allowedIn = ['cookie', 'formData', 'header', 'path', 'query'] as const;

export const getOperationParameters = ({
  openApi,
  parameters,
  config,
  types,
}: {
  config: Config;
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
    parametersQuery: [], // not used in v3 -> @see requestBody
  };

  parameters.forEach((parameterOrReference) => {
    const parameterDef = getRef<OpenApiParameter>(
      openApi,
      parameterOrReference,
    );
    const parameter = getOperationParameter({
      config,
      openApi,
      parameter: parameterDef,
      types,
    });

    const skip =
      config.filterFn?.operationParameter &&
      !config.filterFn?.operationParameter(parameter);
    if (!allowedIn.includes(parameterDef.in) || skip) {
      return;
    }

    switch (parameterDef.in) {
      case 'cookie':
        operationParameters.parametersCookie = [
          ...operationParameters.parametersCookie,
          parameter,
        ];
        break;
      case 'formData':
        operationParameters.parametersForm = [
          ...operationParameters.parametersForm,
          parameter,
        ];
        break;
      case 'header':
        operationParameters.parametersHeader = [
          ...operationParameters.parametersHeader,
          parameter,
        ];
        break;
      case 'path':
        operationParameters.parametersPath = [
          ...operationParameters.parametersPath,
          parameter,
        ];
        break;
      case 'query':
        operationParameters.parametersQuery = [
          ...operationParameters.parametersQuery,
          parameter,
        ];
        break;
    }

    operationParameters.$refs = [
      ...operationParameters.$refs,
      ...parameter.$refs,
    ];
    operationParameters.imports = [
      ...operationParameters.imports,
      ...parameter.imports,
    ];
    operationParameters.parameters = [
      ...operationParameters.parameters,
      parameter,
    ];
  });

  return operationParameters;
};
