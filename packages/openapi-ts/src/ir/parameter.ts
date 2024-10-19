import type { IRParametersObject } from './ir';

export const hasParametersObjectRequired = (
  parameters: IRParametersObject | undefined,
): boolean => {
  if (!parameters) {
    return false;
  }

  for (const name in parameters.cookie) {
    if (parameters.cookie[name].required) {
      return true;
    }
  }

  for (const name in parameters.header) {
    if (parameters.header[name].required) {
      return true;
    }
  }

  for (const name in parameters.path) {
    if (parameters.path[name].required) {
      return true;
    }
  }

  for (const name in parameters.query) {
    if (parameters.query[name].required) {
      return true;
    }
  }

  return false;
};
