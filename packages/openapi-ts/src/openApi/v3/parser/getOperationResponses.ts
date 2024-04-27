import type { OperationResponse } from '../../common/interfaces/client';
import { getRef } from '../../common/parser/getRef';
import { getOperationResponseCode } from '../../common/parser/operation';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiResponse } from '../interfaces/OpenApiResponse';
import type { OpenApiResponses } from '../interfaces/OpenApiResponses';
import { getOperationResponse } from './getOperationResponse';

export const getOperationResponses = (
  openApi: OpenApi,
  responses: OpenApiResponses,
): OperationResponse[] => {
  const operationResponses: OperationResponse[] = [];

  // Iterate over each response code and get the
  // status code and response message
  Object.entries(responses).forEach(([code, responseOrReference]) => {
    const response = getRef<OpenApiResponse>(openApi, responseOrReference);
    const responseCode = getOperationResponseCode(code);

    if (responseCode) {
      const operationResponse = getOperationResponse(
        openApi,
        response,
        responseCode,
      );
      operationResponses.push(operationResponse);
    }
  });

  // Sort the responses to 2xx success codes come before 4xx and 5xx error codes.
  return operationResponses.sort((a, b): number =>
    a.code < b.code ? -1 : a.code > b.code ? 1 : 0,
  );
};
