import type { IRParametersObject } from '../../../ir/ir';
import type { ParameterObject, ReferenceObject } from '../types/spec';

const ensureParametersObject = ({
  parameter,
  parametersObject,
}: {
  parameter: ParameterObject;
  parametersObject: IRParametersObject;
}) => {
  if (!parametersObject[parameter.in]) {
    parametersObject[parameter.in] = {};
  }
};

export const parametersArrayToObject = ({
  parameters,
}: {
  parameters?: ReadonlyArray<ParameterObject | ReferenceObject>;
}): IRParametersObject | undefined => {
  if (!parameters || !Object.keys(parameters).length) {
    return;
  }

  const parametersObject: IRParametersObject = {};

  for (const parameter of parameters) {
    if ('$ref' in parameter) {
      // TODO: parser - resolve $ref
    } else {
      ensureParametersObject({
        parameter,
        parametersObject,
      });
      parametersObject[parameter.in]![parameter.name] = parameter;
    }
  }

  return parametersObject;
};

export const mergeParametersObjects = ({
  source,
  target,
}: {
  source: IRParametersObject | undefined;
  target: IRParametersObject | undefined;
}): IRParametersObject | undefined => {
  const result = { ...target };

  if (source) {
    if (source.cookie) {
      if (result.cookie) {
        result.cookie = {
          ...result.cookie,
          ...source.cookie,
        };
      } else {
        result.cookie = source.cookie;
      }
    }

    if (source.header) {
      if (result.header) {
        result.header = {
          ...result.header,
          ...source.header,
        };
      } else {
        result.header = source.header;
      }
    }

    if (source.path) {
      if (result.path) {
        result.path = {
          ...result.path,
          ...source.path,
        };
      } else {
        result.path = source.path;
      }
    }

    if (source.query) {
      if (result.query) {
        result.query = {
          ...result.query,
          ...source.query,
        };
      } else {
        result.query = source.query;
      }
    }
  }

  if (!Object.keys(result).length) {
    return;
  }

  return result;
};
