import type { IRContext } from '../../../ir/context';
import type { IRParameterObject, IRParametersObject } from '../../../ir/ir';
import type { ParameterObject, ReferenceObject } from '../types/spec';
import { getMediaTypeSchema } from './mediaType';
import { schemaToIrSchema } from './schema';

export const parametersArrayToObject = ({
  context,
  parameters,
}: {
  context: IRContext;
  parameters?: ReadonlyArray<ParameterObject | ReferenceObject>;
}): IRParametersObject | undefined => {
  if (!parameters || !Object.keys(parameters).length) {
    return;
  }

  const parametersObject: IRParametersObject = {};

  for (const parameterOrReference of parameters) {
    const parameter =
      '$ref' in parameterOrReference
        ? context.resolveRef<ParameterObject>(parameterOrReference.$ref)
        : parameterOrReference;

    if (!parametersObject[parameter.in]) {
      parametersObject[parameter.in] = {};
    }

    parametersObject[parameter.in]![parameter.name] = parameterToIrParameter({
      context,
      parameter,
    });
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

const parameterToIrParameter = ({
  context,
  parameter,
}: {
  context: IRContext;
  parameter: ParameterObject;
}): IRParameterObject => {
  // TODO: parser - fix
  let schema = parameter.schema;

  if (!schema) {
    const content = getMediaTypeSchema({
      content: parameter.content,
    });
    if (content) {
      schema = content.schema;
    }
  }

  const irSchema = schemaToIrSchema({
    context,
    schema: {
      deprecated: parameter.deprecated,
      description: parameter.description,
      ...schema,
    },
  });

  const irParameter: IRParameterObject = {
    location: parameter.in,
    name: parameter.name,
    schema: irSchema,
  };

  if (parameter.required) {
    irParameter.required = parameter.required;
  }

  return irParameter;
};

export const parseParameter = ({
  context,
  name,
  parameter,
}: {
  context: IRContext;
  name: string;
  parameter: ParameterObject;
}) => {
  if (!context.ir.components) {
    context.ir.components = {};
  }

  if (!context.ir.components.parameters) {
    context.ir.components.parameters = {};
  }

  context.ir.components.parameters[name] = parameterToIrParameter({
    context,
    parameter,
  });
};
