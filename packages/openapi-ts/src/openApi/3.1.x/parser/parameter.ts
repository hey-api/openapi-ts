import type { IR } from '../../../ir/types';
import { refToName } from '../../../utils/ref';
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
  context: IR.Context;
  parameters?: ReadonlyArray<ParameterObject | ReferenceObject>;
}): IR.ParametersObject | undefined => {
  if (!parameters || !Object.keys(parameters).length) {
    return;
  }

  const parametersObject: IR.ParametersObject = {};

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

const parameterToIrParameter = ({
  context,
  parameter,
}: {
  context: IR.Context;
  parameter: ParameterObject;
}): IR.ParameterObject => {
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

  const irParameter: IR.ParameterObject = {
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

  if (parameter.deprecated) {
    irParameter.deprecated = parameter.deprecated;
  }

  if (parameter.description) {
    irParameter.description = parameter.description;
  }

  if (pagination) {
    irParameter.pagination = pagination;
  }

  if (parameter.required) {
    irParameter.required = parameter.required;
  }

  return irParameter;
};

export const parseParameter = ({
  $ref,
  context,
  parameter,
}: {
  $ref: string;
  context: IR.Context;
  parameter: ParameterObject;
}) => {
  if (!context.ir.components) {
    context.ir.components = {};
  }

  if (!context.ir.components.parameters) {
    context.ir.components.parameters = {};
  }

  context.ir.components.parameters[refToName($ref)] = parameterToIrParameter({
    context,
    parameter,
  });
};
