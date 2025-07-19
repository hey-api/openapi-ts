import type ts from 'typescript';

import { compiler } from '../../compiler';
import type { IR } from '../../ir/types';
import { createSchemaComment } from '../shared/utils/schema';
import { identifiers, zodId } from './constants';
import type { ZodSchema } from './plugin';
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
    factory: (typeName) => compiler.typeReferenceNode({ typeName }),
  });
  const statement = compiler.constVariable({
    comment: plugin.config.comments
      ? createSchemaComment({ schema })
      : undefined,
    exportConst: true,
    expression: zodSchema.expression,
    name: node,
    typeName: zodSchema.typeName
      ? (compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: zodSchema.typeName,
        }) as unknown as ts.TypeNode)
      : undefined,
  });
  file.add(statement);

  if (typeInferId) {
    const inferNode = file.addNodeReference(typeInferId, {
      factory: (typeName) => compiler.typeReferenceNode({ typeName }),
    });
    const nodeIdentifier = file.addNodeReference(schemaId, {
      factory: (text) => compiler.identifier({ text }),
    });
    const inferType = compiler.typeAliasDeclaration({
      exportType: true,
      name: inferNode,
      type: compiler.typeReferenceNode({
        typeArguments: [
          compiler.typeOfExpression({
            text: nodeIdentifier,
          }) as unknown as ts.TypeNode,
        ],
        typeName: compiler.propertyAccessExpression({
          expression: identifiers.z,
          name: identifiers.infer,
        }) as unknown as string,
      }),
    });
    file.add(inferType);
  }
};
