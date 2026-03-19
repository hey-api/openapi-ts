import type { Context } from './context';
import type { Pagination } from './pagination';
import type { IR } from './types';

const getPaginationSchema = ({
  context,
  parameter,
}: {
  context: Context;
  parameter: IR.ParameterObject;
}): IR.SchemaObject | undefined => {
  if (!parameter.pagination) {
    return;
  }

  if (parameter.pagination === true) {
    return parameter.schema;
  }

  let schema = parameter.schema;
  if (schema.$ref) {
    schema = context.resolveIrRef<IR.SchemaObject>(schema.$ref);
  }

  return schema.properties![parameter.pagination]!;
};

export const hasParameterGroupObjectRequired = (
  parameterGroup?: Record<string, IR.ParameterObject>,
): boolean => {
  for (const name in parameterGroup) {
    if (parameterGroup[name]!.required) {
      return true;
    }
  }

  return false;
};

export const hasParametersObjectRequired = (
  parameters: IR.ParametersObject | undefined,
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

export const parameterWithPagination = ({
  context,
  parameters,
}: {
  context: Context;
  parameters: IR.ParametersObject | undefined;
}): Pagination | undefined => {
  if (!parameters) {
    return;
  }

  for (const name in parameters.cookie) {
    const parameter = parameters.cookie[name]!;
    if (parameter.pagination) {
      return {
        in: parameter.location,
        name:
          parameter.pagination === true
            ? parameter.name
            : `${parameter.name}.${parameter.pagination}`,
        schema: getPaginationSchema({ context, parameter })!,
      };
    }
  }

  for (const name in parameters.header) {
    const parameter = parameters.header[name]!;
    if (parameter.pagination) {
      return {
        in: parameter.location,
        name:
          parameter.pagination === true
            ? parameter.name
            : `${parameter.name}.${parameter.pagination}`,
        schema: getPaginationSchema({ context, parameter })!,
      };
    }
  }

  for (const name in parameters.path) {
    const parameter = parameters.path[name]!;
    if (parameter.pagination) {
      return {
        in: parameter.location,
        name:
          parameter.pagination === true
            ? parameter.name
            : `${parameter.name}.${parameter.pagination}`,
        schema: getPaginationSchema({ context, parameter })!,
      };
    }
  }

  for (const name in parameters.query) {
    const parameter = parameters.query[name]!;
    if (parameter.pagination) {
      return {
        in: parameter.location,
        name:
          parameter.pagination === true
            ? parameter.name
            : `${parameter.name}.${parameter.pagination}`,
        schema: getPaginationSchema({ context, parameter })!,
      };
    }
  }

  return;
};
