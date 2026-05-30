import type { IR } from '@hey-api/shared';

export function hasInput(operation: IR.OperationObject): boolean {
  const hasPathParams = Boolean(
    operation.parameters?.path && Object.keys(operation.parameters.path).length,
  );
  const hasQueryParams = Boolean(
    operation.parameters?.query && Object.keys(operation.parameters.query).length,
  );
  const hasHeaderParams = Boolean(
    operation.parameters?.header && Object.keys(operation.parameters.header).length,
  );
  const hasBody = Boolean(operation.body);
  return hasPathParams || hasQueryParams || hasHeaderParams || hasBody;
}

export function getSuccessResponse(
  operation: IR.OperationObject,
): { hasOutput: boolean; statusCode: number } | { hasOutput: false; statusCode?: undefined } {
  let fallback: { hasOutput: boolean; statusCode: number } | undefined;

  if (operation.responses) {
    for (const [statusCode, response] of Object.entries(operation.responses)) {
      const statusCodeNumber = Number.parseInt(statusCode, 10);
      if (statusCodeNumber >= 200 && statusCodeNumber <= 399 && response) {
        const successResponse = {
          hasOutput: Boolean(response.schema),
          statusCode: statusCodeNumber,
        };
        fallback ??= successResponse;
        if (response.mediaType) {
          return successResponse;
        }
      }
    }
  }

  return fallback ?? { hasOutput: false, statusCode: undefined };
}

export function getTags(operation: IR.OperationObject, defaultTag: string): ReadonlyArray<string> {
  return operation.tags && operation.tags.length ? [...operation.tags] : [defaultTag];
}
