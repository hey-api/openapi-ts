import type { IROperationObject } from './ir';
import { hasParametersObjectRequired } from './parameter';

export const hasOperationDataRequired = (
  operation: IROperationObject,
): boolean => {
  if (hasParametersObjectRequired(operation.parameters)) {
    return true;
  }

  if (operation.body?.required) {
    return true;
  }

  return false;
};
