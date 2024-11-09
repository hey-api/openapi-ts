import type { IRContext } from '../../../ir/context';
import type { IRParameterObject, IRParametersObject } from '../../../ir/ir';
import type {
  ParameterObject,
  ReferenceObject,
  SchemaObject,
} from '../types/spec';
import { mediaTypeObject } from './mediaType';
import { paginationField } from './pagination';
import { schemaToIrSchema } from './schema';

/**
 * Returns default parameter `allowReserved` based on value of `in`.
 */
const defaultAllowReserved = (
  _in: ParameterObject['in'],
): boolean | undefined => {
  switch (_in) {
    // this keyword only applies to parameters with an `in` value of `query`
    case 'query':
      return false;
    default:
      return;
  }
};

/**
 * Returns default parameter `explode` based on value of `style`.
 */
const defaultExplode = (style: Required<ParameterObject>['style']): boolean => {
  switch (style) {
    // default value for `deepObject` is `false`, but that behavior is undefined
    // so we use `true` to make this work with the `client-fetch` package
    case 'deepObject':
    case 'form':
      return true;
    default:
      return false;
  }
};

/**
 * Returns default parameter `style` based on value of `in`.
 */
const defaultStyle = (
  _in: ParameterObject['in'],
): Required<ParameterObject>['style'] => {
  switch (_in) {
    case 'header':
    case 'path':
      return 'simple';
    case 'cookie':
    case 'query':
      return 'form';
  }
};

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
    const content = mediaTypeObject({
      content: parameter.content,
    });
    if (content) {
      schema = content.schema;
    }
  }

  const finalSchema: SchemaObject = {
    deprecated: parameter.deprecated,
    description: parameter.description,
    ...schema,
  };

  const pagination = paginationField({
    context,
    name: parameter.name,
    schema: finalSchema,
  });

  const style = parameter.style || defaultStyle(parameter.in);
  const explode =
    parameter.explode !== undefined ? parameter.explode : defaultExplode(style);
  const allowReserved =
    parameter.allowReserved !== undefined
      ? parameter.allowReserved
      : defaultAllowReserved(parameter.in);

  const irParameter: IRParameterObject = {
    allowReserved,
    explode,
    location: parameter.in,
    name: parameter.name,
    schema: schemaToIrSchema({
      context,
      schema: finalSchema,
    }),
    style,
  };

  if (pagination) {
    irParameter.pagination = pagination;
  }

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
