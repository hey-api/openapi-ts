import type { IRParameterObject, IRParametersObject } from './ir';
import type { Pagination } from './pagination';

export const hasParameterGroupObjectRequired = (
  parameterGroup?: Record<string, IRParameterObject>,
): boolean => {
  for (const name in parameterGroup) {
    if (parameterGroup[name].required) {
      return true;
    }
  }

  return false;
};

export const hasParametersObjectRequired = (
  parameters: IRParametersObject | undefined,
): boolean => {
  if (!parameters) {
    return false;
  }

  if (hasParameterGroupObjectRequired(parameters.cookie)) {
    return true;
  }

  if (hasParameterGroupObjectRequired(parameters.header)) {
    return true;
  }

  if (hasParameterGroupObjectRequired(parameters.path)) {
    return true;
  }

  if (hasParameterGroupObjectRequired(parameters.query)) {
    return true;
  }

  return false;
};

export const parameterWithPagination = (
  parameters: IRParametersObject | undefined,
): Pagination | undefined => {
  if (!parameters) {
    return;
  }

  for (const name in parameters.cookie) {
    const parameter = parameters.cookie[name];
    if (parameter.pagination) {
      return {
        in: parameter.location,
        name:
          parameter.pagination === true
            ? name
            : `${name}.${parameter.pagination}`,
        schema:
          parameter.pagination === true
            ? parameter.schema
            : parameter.schema.properties![parameter.pagination],
      };
    }
  }

  for (const name in parameters.header) {
    const parameter = parameters.header[name];
    if (parameter.pagination) {
      return {
        in: parameter.location,
        name:
          parameter.pagination === true
            ? name
            : `${name}.${parameter.pagination}`,
        schema:
          parameter.pagination === true
            ? parameter.schema
            : parameter.schema.properties![parameter.pagination],
      };
    }
  }

  for (const name in parameters.path) {
    const parameter = parameters.path[name];
    if (parameter.pagination) {
      return {
        in: parameter.location,
        name:
          parameter.pagination === true
            ? name
            : `${name}.${parameter.pagination}`,
        schema:
          parameter.pagination === true
            ? parameter.schema
            : parameter.schema.properties![parameter.pagination],
      };
    }
  }

  for (const name in parameters.query) {
    const parameter = parameters.query[name];
    if (parameter.pagination) {
      return {
        in: parameter.location,
        name:
          parameter.pagination === true
            ? name
            : `${name}.${parameter.pagination}`,
        schema:
          parameter.pagination === true
            ? parameter.schema
            : parameter.schema.properties![parameter.pagination],
      };
    }
  }
};
