import type { Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '~/ir/types';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import { tsc } from '~/tsc';

import { identifiers } from '../constants';
import type { ZodPlugin } from '../types';
import type { Ast } from './types';

export const exportAst = ({
  ast,
  plugin,
  schema,
  symbol,
  typeInferSymbol,
}: {
  ast: Ast;
  plugin: ZodPlugin['Instance'];
  schema: IR.SchemaObject;
  symbol: Symbol;
  typeInferSymbol: Symbol | undefined;
}): void => {
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createSchemaComment({ schema })
      : undefined,
    exportConst: symbol.exported,
    expression: ast.expression,
    name: symbol.placeholder,
    typeName: ast.typeName
      ? (tsc.propertyAccessExpression({
          expression: z.placeholder,
          name: ast.typeName,
        }) as unknown as ts.TypeNode)
      : undefined,
  });
  plugin.setSymbolValue(symbol, statement);

  if (typeInferSymbol) {
    const inferType = tsc.typeAliasDeclaration({
      exportType: typeInferSymbol.exported,
      name: typeInferSymbol.placeholder,
      type: tsc.typeReferenceNode({
        typeArguments: [
          tsc.typeOfExpression({
            text: symbol.placeholder,
          }) as unknown as ts.TypeNode,
        ],
        typeName: tsc.propertyAccessExpression({
          expression: z.placeholder,
          name: identifiers.infer,
        }) as unknown as string,
      }),
    });
    plugin.setSymbolValue(typeInferSymbol, inferType);
  }
};
