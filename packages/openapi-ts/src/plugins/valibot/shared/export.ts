import type { Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '~/ir/types';
import { createSchemaComment } from '~/plugins/shared/utils/schema';
import { tsc } from '~/tsc';

import { identifiers } from '../v1/constants';
import { pipesToAst } from './pipesToAst';
import type { Ast, IrSchemaToAstOptions } from './types';

export const exportAst = ({
  ast,
  plugin,
  schema,
  state,
  symbol,
}: IrSchemaToAstOptions & {
  ast: Ast;
  schema: IR.SchemaObject;
  symbol: Symbol;
}): void => {
  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createSchemaComment({ schema })
      : undefined,
    exportConst: symbol.exported,
    expression: pipesToAst({ pipes: ast.pipes, plugin }),
    name: symbol.placeholder,
    typeName: state.hasLazyExpression.value
      ? (tsc.propertyAccessExpression({
          expression: v.placeholder,
          name: ast.typeName || identifiers.types.GenericSchema.text,
        }) as unknown as ts.TypeNode)
      : undefined,
  });
  plugin.setSymbolValue(symbol, statement);
};
