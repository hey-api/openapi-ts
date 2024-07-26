import type { Client } from '../../../types/client';
import type { OperationResponse } from '../../common/interfaces/client';
import { getRef } from '../../common/parser/getRef';
import {
  parseResponseStatusCode,
  sorterByResponseStatusCode,
  tagResponseTypes,
} from '../../common/parser/operation';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiResponse } from '../interfaces/OpenApiResponse';
import type { OpenApiResponses } from '../interfaces/OpenApiResponses';
import { getOperationResponse } from './getOperationResponse';

export const getOperationResponses = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  debug,
  openApi,
  responses,
  types,
}: {
  debug?: boolean;
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

  operationResponses = tagResponseTypes(operationResponses);

  return operationResponses.sort(sorterByResponseStatusCode);
};
