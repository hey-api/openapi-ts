import { compiler } from "../../compiler";
import { operationResponsesMap } from "../../ir/operation";
import type { IR } from "../../ir/types";

interface ResponseSchema {
  schema: IR.SchemaObject | undefined;
  statusCode: string;
}

export const getSuccessResponse = (operation: IR.OperationObject): ResponseSchema | undefined => {
  const { responses } = operationResponsesMap(operation);
  if (!responses?.properties) {
    return;
  }
  const statusCode = Object.keys(responses.properties)[0]
  if (!statusCode) {
    return;
  }
  return {
    schema: responses.properties[statusCode],
    statusCode,
  }
}

const getResponseStatus = (statusCode: string | undefined): number => {
  if (!statusCode || statusCode === '2XX') {
    return 200;
  }
  return Number.parseInt(statusCode, 10)
}

export const responseOptions = ({
  responseSchema,
}: {
  responseSchema: ResponseSchema | undefined;
}) => {
  const status = getResponseStatus(responseSchema?.statusCode)
  return compiler.objectExpression({
    obj: [
      {
        key: 'status',
        value: status,
      },
    ],
  })
}
