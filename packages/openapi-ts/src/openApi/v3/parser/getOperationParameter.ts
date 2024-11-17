import type { Client } from '../../../types/client';
import { refParametersPartial } from '../../../utils/const';
import { enumMeta } from '../../../utils/enum';
import type { OperationParameter } from '../../common/interfaces/client';
import { getDefault } from '../../common/parser/getDefault';
import { getPattern } from '../../common/parser/getPattern';
import { getRef } from '../../common/parser/getRef';
import { operationParameterNameFn } from '../../common/parser/operation';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiParameter } from '../interfaces/OpenApiParameter';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getModel } from './getModel';
import { isDefinitionNullable } from './inferType';
import { getParameterSchema } from './parameter';

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
    deprecated: parameter.deprecated === true,
    description: parameter.description || null,
    enum: [],
    enums: [],
    export: 'interface',
    imports: [],
    in: parameter.in,
    isDefinition: false,
    isNullable: isDefinitionNullable(parameter),
    isReadOnly: false,
    isRequired: parameter.required === true,
    link: null,
    mediaType: null,
    prop: parameter.name,
    properties: [],
    template: null,
    type: 'unknown',
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
    return operationParameter;
  }

  let schema = getParameterSchema(parameter);
  if (schema) {
    if (schema.$ref?.startsWith(refParametersPartial)) {
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
      operationParameter.default = getDefault(schema);
      return operationParameter;
    }

    const model = getModel({ definition: schema, openApi, types });
    operationParameter = {
      ...operationParameter,
      $refs: [...operationParameter.$refs, ...model.$refs],
      base: model.base,
      enum: [...operationParameter.enum, ...model.enum],
      enums: [...operationParameter.enums, ...model.enums],
      exclusiveMaximum: model.exclusiveMaximum,
      exclusiveMinimum: model.exclusiveMinimum,
      export: model.export,
      format: model.format,
      imports: [...operationParameter.imports, ...model.imports],
      isNullable: operationParameter.isNullable || model.isNullable,
      isReadOnly: model.isReadOnly,
      isRequired: operationParameter.isRequired || model.isRequired,
      link: model.link,
      maxItems: model.maxItems,
      maxLength: model.maxLength,
      maxProperties: model.maxProperties,
      maximum: model.maximum,
      minItems: model.minItems,
      minLength: model.minLength,
      minProperties: model.minProperties,
      minimum: model.minimum,
      multipleOf: model.multipleOf,
      pattern: getPattern(model.pattern),
      properties: [...operationParameter.properties, ...model.properties],
      template: model.template,
      type: model.type,
      uniqueItems: model.uniqueItems,
    };
    if (
      (operationParameter.enum.length || operationParameter.enums.length) &&
      !operationParameter.meta
    ) {
      operationParameter.meta = enumMeta(operationParameter);
    }
    operationParameter.default = model.default;
    return operationParameter;
  }

  return operationParameter;
};
