import type { IR } from '../../../ir/types';
import type {
  OperationObject,
  ParameterObject,
  ReferenceObject,
  SchemaObject,
} from '../types/spec';
import { paginationField } from './pagination';
import { schemaToIrSchema } from './schema';

type Parameter = Exclude<ParameterObject, { in: 'body' }>;

/**
 * Returns default parameter `explode` based on value of `collectionFormat`.
 */
const defaultExplode = (
  collectionFormat: Parameter['collectionFormat'],
): boolean => {
  switch (collectionFormat) {
    case 'multi':
      return true;
    case 'csv':
    case 'pipes':
    case 'ssv':
    case 'tsv':
    default:
      return false;
  }
};

/**
 * Returns default parameter `style` based on value of `in`.
 */
const defaultStyle = (
  _in: Parameter['in'],
): Required<IR.ParameterObject>['style'] => {
  switch (_in) {
    case 'header':
    case 'path':
      return 'simple';
    case 'query':
    default:
      return 'form';
  }
};

export const parametersArrayToObject = ({
  context,
  operation,
  parameters,
}: {
  context: IR.Context;
  operation: OperationObject;
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

    // push request body parameters into a separate field
    if (parameter.in === 'body' || parameter.in === 'formData') {
      // @ts-expect-error
      if (!operation.requestBody) {
        // @ts-expect-error
        operation.requestBody = [];
      }

      // @ts-expect-error
      operation.requestBody.push(parameter);
      continue;
    }

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
  parameter: Parameter;
}): IR.ParameterObject => {
  const schema = parameter;

  const finalSchema: SchemaObject =
    schema && '$ref' in schema
      ? {
          allOf: [
            {
              ...schema,
              $ref: schema.$ref as string,
              required: Array.isArray(schema.required) ? schema.required : [],
              type: schema.type as SchemaObject['type'],
            },
          ],
          description: parameter.description,
        }
      : {
          description: parameter.description,
          ...schema,
          required: Array.isArray(schema.required) ? schema.required : [],
          type: schema.type as SchemaObject['type'],
        };

  const pagination = paginationField({
    context,
    name: parameter.name,
    schema: finalSchema,
  });

  const style = defaultStyle(parameter.in);
  const explode = defaultExplode(parameter.collectionFormat);
  const allowReserved = false;

  const irParameter: IR.ParameterObject = {
    allowReserved,
    explode,
    location: parameter.in as IR.ParameterObject['location'],
    name: parameter.name,
    schema: schemaToIrSchema({
      context,
      schema: finalSchema,
    }),
    style,
  };

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
