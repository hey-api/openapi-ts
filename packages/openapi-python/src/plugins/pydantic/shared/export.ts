import { applyNaming, pathToName } from '@hey-api/shared';

// import { createSchemaComment } from '../../../plugins/shared/utils/schema';
import { $ } from '../../../py-dsl';
import type { ProcessorContext } from './processor';
// import { identifiers } from '../v2/constants';
// import { pipesToNode } from './pipes';
import type { PydanticFinal } from './types';

export function exportAst({
  final,
  meta,
  naming,
  namingAnchor,
  path,
  plugin,
  tags,
}: ProcessorContext & {
  final: PydanticFinal;
}): void {
  const name = pathToName(path, { anchor: namingAnchor });
  const symbol = plugin.symbol(applyNaming(name, naming), {
    meta: {
      category: 'schema',
      path,
      tags,
      tool: 'pydantic',
      ...meta,
    },
  });

  if (final.fields) {
    const baseModel = plugin.external('pydantic.BaseModel');
    const classDef = $.class(symbol).extends(baseModel);
    // .export()
    // .$if(plugin.config.comments && createSchemaComment(schema), (c, v) => c.doc(v))
    // .$if(state.hasLazyExpression['~ref'], (c) =>
    //   c.type($.type(v).attr(ast.typeName || identifiers.types.GenericSchema)),
    // )
    // .assign(pipesToNode(ast.pipes, plugin));

    for (const field of final.fields) {
      // TODO: Field(...) constraints in next pass
      classDef.do($.var(field.name).assign($.literal('hey')));
      // classDef.do($.var(field.name).annotate(field.typeAnnotation));
    }

    plugin.node(classDef);
  } else {
    const statement = $.var(symbol)
      // .export()
      // .$if(plugin.config.comments && createSchemaComment(schema), (c, v) => c.doc(v))
      .assign(final.typeAnnotation);

    plugin.node(statement);
  }
}
