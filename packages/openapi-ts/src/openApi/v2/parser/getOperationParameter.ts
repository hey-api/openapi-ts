import type { Client } from '../../../types/client';
import type { OperationParameter } from '../../common/interfaces/client';
import { getDefault } from '../../common/parser/getDefault';
import { getEnums } from '../../common/parser/getEnums';
import { getPattern } from '../../common/parser/getPattern';
import { getRef } from '../../common/parser/getRef';
import { operationParameterNameFn } from '../../common/parser/operation';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiParameter } from '../interfaces/OpenApiParameter';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getModel } from './getModel';

export const getOperationParameter = ({
  openApi,
  parameter,
  types,
}: {
  openApi: OpenApi;
  parameter: OpenApiParameter;
  types: Client['types'];
}): OperationParameter => {
  const operationParameterWithoutName: Omit<OperationParameter, 'name'> = {
    $refs: [],
    base: 'unknown',
    description: parameter.description || null,
    enum: [],
    enums: [],
    exclusiveMaximum: parameter.exclusiveMaximum,
    exclusiveMinimum: parameter.exclusiveMinimum,
    export: 'interface',
    format: parameter.format,
    imports: [],
    in: parameter.in,
    isDefinition: false,
    isNullable: parameter['x-nullable'] === true,
    isReadOnly: false,
    isRequired: parameter.required === true,
    link: null,
    maxItems: parameter.maxItems,
    maxLength: parameter.maxLength,
    maximum: parameter.maximum,
    mediaType: null,
    minItems: parameter.minItems,
    minLength: parameter.minLength,
    minimum: parameter.minimum,
    multipleOf: parameter.multipleOf,
    pattern: getPattern(parameter.pattern),
    prop: parameter.name,
    properties: [],
    template: null,
    type: 'unknown',
    uniqueItems: parameter.uniqueItems,
  };
  let operationParameter = {
    ...operationParameterWithoutName,
    name: operationParameterNameFn(operationParameterWithoutName),
  };

  if (parameter.$ref) {
    const model = getType({ type: parameter.$ref });
    operationParameter = {
      ...operationParameter,
      $refs: [...operationParameter.$refs, ...model.$refs],
      base: model.base,
      export: 'reference',
      imports: [...operationParameter.imports, ...model.imports],
      template: model.template,
      type: model.type,
    };
    operationParameter.default = getDefault(parameter, operationParameter);
    return operationParameter;
  }

  if (parameter.enum) {
    const model = getEnums(parameter, parameter.enum);
    if (model.length) {
      operationParameter = {
        ...operationParameter,
        base: 'string',
        enum: [...operationParameter.enum, ...model],
        export: 'enum',
        type: 'string',
      };
      operationParameter.default = getDefault(parameter, operationParameter);
      return operationParameter;
    }
  }

  if (parameter.type === 'array' && parameter.items) {
    const model = getType({
      format: parameter.items.format,
      type: parameter.items.type,
    });
    operationParameter = {
      ...operationParameter,
      $refs: [...operationParameter.$refs, ...model.$refs],
      base: model.base,
      export: 'array',
      imports: [...operationParameter.imports, ...model.imports],
      template: model.template,
      type: model.type,
    };
    operationParameter.default = getDefault(parameter, operationParameter);
    return operationParameter;
  }

  if (parameter.type === 'object' && parameter.items) {
    const model = getType({
      format: parameter.items.format,
      type: parameter.items.type,
    });
    operationParameter = {
      ...operationParameter,
      $refs: [...operationParameter.$refs, ...model.$refs],
      base: model.base,
      export: 'dictionary',
      imports: [...operationParameter.imports, ...model.imports],
      template: model.template,
      type: model.type,
    };
    operationParameter.default = getDefault(parameter, operationParameter);
    return operationParameter;
  }

  let schema = parameter.schema;
  if (schema) {
    if (schema.$ref?.startsWith('#/parameters/')) {
      schema = getRef<OpenApiSchema>(openApi, schema);
    }

    if (schema.$ref) {
      const model = getType({ type: schema.$ref });
      operationParameter = {
        ...operationParameter,
        $refs: [...operationParameter.$refs, ...model.$refs],
        base: model.base,
        export: 'reference',
        imports: [...operationParameter.imports, ...model.imports],
        template: model.template,
        type: model.type,
      };
      operationParameter.default = getDefault(parameter, operationParameter);
      return operationParameter;
    }

    const model = getModel({ definition: schema, openApi, types });
    operationParameter = {
      ...operationParameter,
      $refs: [...operationParameter.$refs, ...model.$refs],
      base: model.base,
      enum: [...operationParameter.enum, ...model.enum],
      enums: [...operationParameter.enums, ...model.enums],
      export: model.export,
      imports: [...operationParameter.imports, ...model.imports],
      link: model.link,
      properties: [...operationParameter.properties, ...model.properties],
      template: model.template,
      type: model.type,
    };
    operationParameter.default = getDefault(parameter, operationParameter);
    return operationParameter;
  }

  // If the parameter has a type than it can be a basic or generic type.
  if (parameter.type) {
    const model = getType({
      format: parameter.format,
      type: parameter.type,
    });
    operationParameter = {
      ...operationParameter,
      $refs: [...operationParameter.$refs, ...model.$refs],
      base: model.base,
      export: 'generic',
      imports: [...operationParameter.imports, ...model.imports],
      template: model.template,
      type: model.type,
    };
    operationParameter.default = getDefault(parameter, operationParameter);
    return operationParameter;
  }

  return operationParameter;
};
