import type { Client } from '../../../types/client';
import type { OperationResponse } from '../../common/interfaces/client';
import { getRef } from '../../common/parser/getRef';
import { parseResponseStatusCode } from '../../common/parser/operation';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiResponse } from '../interfaces/OpenApiResponse';
import type { OpenApiResponses } from '../interfaces/OpenApiResponses';
import { getOperationResponse } from './getOperationResponse';

export const getOperationResponses = ({
  openApi,
  responses,
  types,
}: {
  openApi: OpenApi;
  responses: OpenApiResponses;
  types: Client['types'];
}): OperationResponse[] => {
  let operationResponses: OperationResponse[] = [];

  Object.entries(responses).forEach(([responseCode, responseOrReference]) => {
    const code = parseResponseStatusCode(responseCode);
    if (!code) {
      return;
    }

    const response = getRef<OpenApiResponse>(openApi, responseOrReference);
    const operationResponse = getOperationResponse({
      code,
      openApi,
      response,
      types,
    });
    operationResponses = [...operationResponses, operationResponse];
  });

  // Sort the responses to 2xx success codes come before 4xx and 5xx error codes.
  return operationResponses.sort((a, b): number =>
    a.code < b.code ? -1 : a.code > b.code ? 1 : 0,
  );
};
