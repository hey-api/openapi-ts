import type { Client } from '../../../types/client';
import type { OperationParameter } from '../../common/interfaces/client';
import { getPattern } from '../../common/parser/getPattern';
import { getType } from '../../common/parser/type';
import type { OpenApi } from '../interfaces/OpenApi';
import type { OpenApiRequestBody } from '../interfaces/OpenApiRequestBody';
import { getContent } from './getContent';
import { getModel } from './getModel';

export const getOperationRequestBody = ({
  body,
  debug,
  openApi,
  types,
}: {
  body: OpenApiRequestBody;
  debug?: boolean;
  openApi: OpenApi;
  types: Client['types'];
}): OperationParameter => {
  const name = body['x-body-name'] ?? 'requestBody';

  const requestBody: OperationParameter = {
    $refs: [],
    base: 'unknown',
    default: undefined,
    description: body.description || null,
    enum: [],
    enums: [],
    export: 'interface',
    imports: [],
    in: 'body',
    isDefinition: false,
    isNullable: body.nullable === true,
    isReadOnly: false,
    isRequired: body.required === true,
    link: null,
    mediaType: null,
    name,
    prop: name,
    properties: [],
    template: null,
    type: 'unknown',
  };

  if (!body.content) {
    return requestBody;
  }

  const content = getContent(openApi, body.content);
  if (!content) {
    return requestBody;
  }

  requestBody.mediaType = content.mediaType;

  switch (requestBody.mediaType) {
    case 'application/x-www-form-urlencoded':
    case 'multipart/form-data':
      requestBody.in = 'formData';
      requestBody.name = 'formData';
      requestBody.prop = 'formData';
      break;
  }

  if (content.schema.$ref) {
    const model = getType({ type: content.schema.$ref });
    requestBody.export = 'reference';
    requestBody.type = model.type;
    requestBody.base = model.base;
    requestBody.template = model.template;
    requestBody.$refs = [...requestBody.$refs, ...model.$refs];
    requestBody.imports = [...requestBody.imports, ...model.imports];
    return requestBody;
  }

  const model = getModel({
    debug,
    definition: content.schema,
    openApi,
    types,
  });
  requestBody.$refs = [...requestBody.$refs, ...model.$refs];
  requestBody.base = model.base;
  requestBody.enum = [...requestBody.enum, ...model.enum];
  requestBody.enums = [...requestBody.enums, ...model.enums];
  requestBody.exclusiveMaximum = model.exclusiveMaximum;
  requestBody.exclusiveMinimum = model.exclusiveMinimum;
  requestBody.export = model.export;
  requestBody.format = model.format;
  requestBody.imports = [...requestBody.imports, ...model.imports];
  requestBody.isNullable = requestBody.isNullable || model.isNullable;
  requestBody.isReadOnly = model.isReadOnly;
  requestBody.isRequired = requestBody.isRequired || model.isRequired;
  requestBody.link = model.link;
  requestBody.maximum = model.maximum;
  requestBody.maxItems = model.maxItems;
  requestBody.maxLength = model.maxLength;
  requestBody.maxProperties = model.maxProperties;
  requestBody.minimum = model.minimum;
  requestBody.minItems = model.minItems;
  requestBody.minLength = model.minLength;
  requestBody.minProperties = model.minProperties;
  requestBody.multipleOf = model.multipleOf;
  requestBody.pattern = getPattern(model.pattern);
  requestBody.properties = [...requestBody.properties, ...model.properties];
  requestBody.template = model.template;
  requestBody.type = model.type;
  requestBody.uniqueItems = model.uniqueItems;
  return requestBody;
};
