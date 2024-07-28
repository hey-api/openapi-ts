import type { Client } from '../../../types/client';
import type { OperationResponse } from '../../common/interfaces/client';
import { getPattern } from '../../common/parser/getPattern';
import { getRef } from '../../common/parser/getRef';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiResponse } from '../interfaces/OpenApiResponse';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getModel } from './getModel';

export const getOperationResponse = ({
  code,
  openApi,
  response,
  types,
}: {
  code: OperationResponse['code'];
  openApi: OpenApi;
  response: OpenApiResponse;
  types: Client['types'];
}): OperationResponse => {
  const operationResponse: OperationResponse = {
    $refs: [],
    base: code !== 204 ? 'unknown' : 'void',
    code,
    description: response.description || null,
    enum: [],
    enums: [],
    export: 'generic',
    imports: [],
    in: 'response',
    isDefinition: false,
    isNullable: false,
    isReadOnly: false,
    isRequired: false,
    link: null,
    name: '',
    properties: [],
    responseTypes: [],
    template: null,
    type: code !== 204 ? 'unknown' : 'void',
  };

  let schema = response.schema;
  if (schema) {
    if (schema.$ref?.startsWith('#/responses/')) {
      schema = getRef<OpenApiSchema>(openApi, schema);
    }

    if (schema.$ref) {
      const model = getType({ type: schema.$ref });
      operationResponse.export = 'reference';
      operationResponse.type = model.type;
      operationResponse.base = model.base;
      operationResponse.template = model.template;
      operationResponse.imports = [
        ...operationResponse.imports,
        ...model.imports,
      ];
      return operationResponse;
    }

    const model = getModel({ definition: schema, openApi, types });
    operationResponse.export = model.export;
    operationResponse.type = model.type;
    operationResponse.base = model.base;
    operationResponse.template = model.template;
    operationResponse.link = model.link;
    operationResponse.isReadOnly = model.isReadOnly;
    operationResponse.isRequired = model.isRequired;
    operationResponse.isNullable = model.isNullable;
    operationResponse.format = model.format;
    operationResponse.maximum = model.maximum;
    operationResponse.exclusiveMaximum = model.exclusiveMaximum;
    operationResponse.minimum = model.minimum;
    operationResponse.exclusiveMinimum = model.exclusiveMinimum;
    operationResponse.multipleOf = model.multipleOf;
    operationResponse.maxLength = model.maxLength;
    operationResponse.minLength = model.minLength;
    operationResponse.maxItems = model.maxItems;
    operationResponse.minItems = model.minItems;
    operationResponse.uniqueItems = model.uniqueItems;
    operationResponse.maxProperties = model.maxProperties;
    operationResponse.minProperties = model.minProperties;
    operationResponse.pattern = getPattern(model.pattern);
    operationResponse.imports = [
      ...operationResponse.imports,
      ...model.imports,
    ];
    operationResponse.enum = [...operationResponse.enum, ...model.enum];
    operationResponse.enums = [...operationResponse.enums, ...model.enums];
    operationResponse.properties = [
      ...operationResponse.properties,
      ...model.properties,
    ];
    return operationResponse;
  }

  // We support basic properties from response headers, since both
  // fetch and XHR client just support string types.
  if (response.headers) {
    for (const name in response.headers) {
      operationResponse.in = 'header';
      operationResponse.name = name;
      operationResponse.type = 'string';
      operationResponse.base = 'string';
      return operationResponse;
    }
  }

  return operationResponse;
};
