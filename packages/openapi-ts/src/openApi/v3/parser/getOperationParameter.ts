import type { OperationParameter } from '../../common/interfaces/client';
import { getDefault } from '../../common/parser/getDefault';
import { getPattern } from '../../common/parser/getPattern';
import { getRef } from '../../common/parser/getRef';
import { getOperationParameterName } from '../../common/parser/operation';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiParameter } from '../interfaces/OpenApiParameter';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getModel } from './getModel';
import { isDefinitionNullable } from './inferType';

export const getOperationParameter = (
  openApi: OpenApi,
  parameter: OpenApiParameter,
): OperationParameter => {
  const operationParameter: OperationParameter = {
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
    name: getOperationParameterName(parameter.name),
    prop: parameter.name,
    properties: [],
    template: null,
    type: 'unknown',
  };

  if (parameter.$ref) {
    const definitionRef = getType({ type: parameter.$ref });
    operationParameter.export = 'reference';
    operationParameter.type = definitionRef.type;
    operationParameter.base = definitionRef.base;
    operationParameter.template = definitionRef.template;
    operationParameter.$refs = [
      ...operationParameter.$refs,
      ...definitionRef.$refs,
    ];
    operationParameter.imports = [
      ...operationParameter.imports,
      ...definitionRef.imports,
    ];
    return operationParameter;
  }

  let schema = parameter.schema;
  if (schema) {
    if (schema.$ref?.startsWith('#/components/parameters/')) {
      schema = getRef<OpenApiSchema>(openApi, schema);
    }
    if (schema.$ref) {
      const model = getType({ type: schema.$ref });
      operationParameter.export = 'reference';
      operationParameter.type = model.type;
      operationParameter.base = model.base;
      operationParameter.template = model.template;
      operationParameter.$refs = [...operationParameter.$refs, ...model.$refs];
      operationParameter.imports = [
        ...operationParameter.imports,
        ...model.imports,
      ];
      operationParameter.default = getDefault(schema);
      return operationParameter;
    } else {
      const model = getModel({ definition: schema, openApi });
      operationParameter.export = model.export;
      operationParameter.type = model.type;
      operationParameter.base = model.base;
      operationParameter.template = model.template;
      operationParameter.link = model.link;
      operationParameter.isReadOnly = model.isReadOnly;
      operationParameter.isRequired =
        operationParameter.isRequired || model.isRequired;
      operationParameter.isNullable =
        operationParameter.isNullable || model.isNullable;
      operationParameter.format = model.format;
      operationParameter.maximum = model.maximum;
      operationParameter.exclusiveMaximum = model.exclusiveMaximum;
      operationParameter.minimum = model.minimum;
      operationParameter.exclusiveMinimum = model.exclusiveMinimum;
      operationParameter.multipleOf = model.multipleOf;
      operationParameter.maxLength = model.maxLength;
      operationParameter.minLength = model.minLength;
      operationParameter.maxItems = model.maxItems;
      operationParameter.minItems = model.minItems;
      operationParameter.uniqueItems = model.uniqueItems;
      operationParameter.maxProperties = model.maxProperties;
      operationParameter.minProperties = model.minProperties;
      operationParameter.pattern = getPattern(model.pattern);
      operationParameter.default = model.default;
      operationParameter.$refs = [...operationParameter.$refs, ...model.$refs];
      operationParameter.imports = [
        ...operationParameter.imports,
        ...model.imports,
      ];
      operationParameter.enum.push(...model.enum);
      operationParameter.enums.push(...model.enums);
      operationParameter.properties.push(...model.properties);
      return operationParameter;
    }
  }

  return operationParameter;
};
