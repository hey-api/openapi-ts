import type { OperationParameter } from '../openApi';

/**
 * Does this operation have at least one required parameter?
 * @returns boolean
 */
export const isOperationParameterRequired = (
  parameters: OperationParameter[],
) => {
  const isRequired = parameters.some((parameter) => parameter.isRequired);
  return isRequired;
};
