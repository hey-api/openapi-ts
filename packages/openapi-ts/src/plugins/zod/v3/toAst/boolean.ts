import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import type { CallTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';

export const booleanToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'boolean'>;
}): ts.CallExpression => {
  let chain: CallTsDsl;

  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  if (typeof schema.const === 'boolean') {
    chain = $(z.placeholder)
      .attr(identifiers.literal)
      .call($.literal(schema.const));
    return chain.$render();
  }

  chain = $(z.placeholder).attr(identifiers.boolean).call();
  return chain.$render();
};
