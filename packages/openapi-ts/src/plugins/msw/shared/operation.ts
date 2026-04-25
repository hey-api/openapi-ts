import type { IR } from '@hey-api/shared';

export function getOperationComment(operation: IR.OperationObject): string {
  return `Handler for the \`${operation.method.toUpperCase()} ${operation.path}\` operation.`;
}
