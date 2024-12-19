import type { IR } from '../../../ir/types';
import { refToName } from '../../../utils/ref';
import type { RequestBodyObject, SchemaObject } from '../types/spec';
import { mediaTypeObject } from './mediaType';
import { schemaToIrSchema } from './schema';

const requestBodyToIrRequestBody = ({
  context,
  requestBody,
}: {
  context: IR.Context;
  requestBody: RequestBodyObject;
}): IR.RequestBodyObject => {
  // TODO: parser - fix
  const content = mediaTypeObject({
    content: requestBody.content,
  });
  const schema = content ? content.schema : undefined;

  const finalSchema: SchemaObject = {
    description: requestBody.description,
    ...schema,
  };

  const irRequestBody: IR.RequestBodyObject = {
    schema: schemaToIrSchema({
      context,
      schema: finalSchema,
    }),
  };

  if (requestBody.description) {
    irRequestBody.description = requestBody.description;
  }

  if (requestBody.required) {
    irRequestBody.required = requestBody.required;
  }

  return irRequestBody;
};

export const parseRequestBody = ({
  $ref,
  context,
  requestBody,
}: {
  $ref: string;
  context: IR.Context;
  requestBody: RequestBodyObject;
}) => {
  if (!context.ir.components) {
    context.ir.components = {};
  }

  if (!context.ir.components.requestBodies) {
    context.ir.components.requestBodies = {};
  }

  context.ir.components.requestBodies[refToName($ref)] =
    requestBodyToIrRequestBody({
      context,
      requestBody,
    });
};
