import type { Client } from '../../../types/client';
import type { OperationResponse } from '../../common/interfaces/client';
import { getPattern } from '../../common/parser/getPattern';
import { getRef } from '../../common/parser/getRef';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiResponse } from '../interfaces/OpenApiResponse';
import type { OpenApiSchema } from '../interfaces/OpenApiSchema';
import { getContent } from './getContent';
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

  if (response.content) {
    const content = getContent(openApi, response.content);
    if (content) {
      if (content.schema.$ref?.startsWith('#/components/responses/')) {
        content.schema = getRef<OpenApiSchema>(openApi, content.schema);
      }

      if (content.schema.$ref) {
        const model = getType({ type: content.schema.$ref });
        operationResponse.base = model.base;
        operationResponse.export = 'reference';
        operationResponse.$refs = [...operationResponse.$refs, ...model.$refs];
        operationResponse.imports = [
          ...operationResponse.imports,
          ...model.imports,
        ];
        operationResponse.template = model.template;
        operationResponse.type = model.type;
        return operationResponse;
      }

      const model = getModel({ definition: content.schema, openApi, types });
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
      operationResponse.$refs = [...operationResponse.$refs, ...model.$refs];
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
