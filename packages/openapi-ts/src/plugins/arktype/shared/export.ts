import type { Symbol } from '@hey-api/codegen-core';
import ts from 'typescript';

import type { IR } from '~/ir/types';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import { tsc } from '~/tsc';

import { identifiers } from '../constants';
import type { ArktypePlugin } from '../types';
import type { Ast } from './types';

export const exportAst = ({
  ast,
  plugin,
  schema,
  symbol,
  typeInferSymbol,
}: {
  ast: Ast;
  plugin: ArktypePlugin['Instance'];
  schema: IR.SchemaObject;
  symbol: Symbol;
  typeInferSymbol: Symbol | undefined;
}): void => {
  const type = plugin.referenceSymbol({
    category: 'external',
    resource: 'arktype.type',
  });

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createSchemaComment({ schema })
      : undefined,
    exportConst: symbol.exported,
    expression: tsc.callExpression({
      functionName: type.placeholder,
      parameters: [
        ast.def ? tsc.stringLiteral({ text: ast.def }) : ast.expression,
      ],
    }),
    name: symbol.placeholder,
    // typeName: ast.typeName
    //   ? (tsc.propertyAccessExpression({
    //       expression: z.placeholder,
    //       name: ast.typeName,
    //     }) as unknown as ts.TypeNode)
    //   : undefined,
  });
  plugin.setSymbolValue(symbol, statement);

  if (typeInferSymbol) {
    const inferType = tsc.typeAliasDeclaration({
      exportType: typeInferSymbol.exported,
      name: typeInferSymbol.placeholder,
      type: ts.factory.createTypeQueryNode(
        ts.factory.createQualifiedName(
          ts.factory.createIdentifier(symbol.placeholder),
          identifiers.type.infer,
        ),
      ),
    });
    plugin.setSymbolValue(typeInferSymbol, inferType);
  }
};
