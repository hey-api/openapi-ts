import type ts from 'typescript';

import type { IR } from '../../ir/types';
import { tsc } from '../../tsc';
import { createSchemaComment } from '../shared/utils/schema';
import { identifiers, zodId } from './constants';
import type { ZodSchema } from './shared/types';
import type { ZodPlugin } from './types';

export const exportZodSchema = ({
  plugin,
  schema,
  schemaId,
  typeInferId,
  zodSchema,
}: {
  plugin: ZodPlugin['Instance'];
  schema: IR.SchemaObject;
  schemaId: string;
  typeInferId: string | undefined;
  zodSchema: ZodSchema;
}) => {
  const file = plugin.context.file({ id: zodId })!;
  const node = file.addNodeReference(schemaId, {
    factory: (typeName) => tsc.typeReferenceNode({ typeName }),
  });
  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createSchemaComment({ schema })
      : undefined,
    exportConst: true,
    expression: zodSchema.expression,
    name: node,
    typeName: zodSchema.typeName
      ? (tsc.propertyAccessExpression({
          expression: identifiers.z,
          name: zodSchema.typeName,
        }) as unknown as ts.TypeNode)
      : undefined,
  });
  file.add(statement);

  if (typeInferId) {
    const inferNode = file.addNodeReference(typeInferId, {
      factory: (typeName) => tsc.typeReferenceNode({ typeName }),
    });
    const nodeIdentifier = file.addNodeReference(schemaId, {
      factory: (text) => tsc.identifier({ text }),
    });
    const inferType = tsc.typeAliasDeclaration({
      exportType: true,
      name: inferNode,
      type: tsc.typeReferenceNode({
        typeArguments: [
          tsc.typeOfExpression({
            text: nodeIdentifier,
          }) as unknown as ts.TypeNode,
        ],
        typeName: tsc.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.infer,
        }) as unknown as string,
      }),
    });
    file.add(inferType);
  }
};
