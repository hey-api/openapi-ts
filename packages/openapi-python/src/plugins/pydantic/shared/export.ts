import type { Symbol } from '@hey-api/codegen-core';
import { buildSymbolIn, pathToName } from '@hey-api/shared';

import { $ } from '../dsl';
import { BASE_MODEL_META, createBaseModel } from './base-model';
import type { ProcessorContext } from './processor';
import type { PydanticNode } from './types';

export function exportAst({
  meta,
  naming,
  namingAnchor,
  node,
  path,
  plugin,
  schema,
  tags,
}: ProcessorContext & {
  node: PydanticNode;
}): void {
  const name = pathToName(path, { anchor: namingAnchor });
  const symbol = plugin.registerSymbol(
    buildSymbolIn({
      meta: {
        category: 'schema',
        path,
        tags,
        tool: 'pydantic',
        ...meta,
      },
      name,
      naming,
      plugin,
      schema,
    }),
  );

  if (node.kind === 'enum') {
    const enumNode = $.enum(symbol).members(...node.members);
    plugin.node(enumNode);
    return;
  }

  if (node.kind === 'model') {
    if (plugin.config.modelType === 'BaseModel') {
      let baseModelSymbol: Symbol | undefined = plugin.querySymbol(BASE_MODEL_META);
      if (!baseModelSymbol) {
        baseModelSymbol = plugin.symbol('BaseModel', {
          children: [...plugin.symbols.BaseModel.children],
          meta: BASE_MODEL_META,
        });
        const baseModel = createBaseModel(plugin, baseModelSymbol);
        plugin.node(baseModel);
      }
    }

    const model = $.model(plugin, symbol)
      .$if(plugin.config.strict, (m) => m.config({ extra: 'forbid' }))
      .$if(node.config, (m, c) => m.config(c))
      .fields(...node.fields);
    plugin.node(model);
    return;
  }

  if (node.kind === 'rootModel') {
    const rootModel = $.rootModel(plugin, symbol)
      .type(node.type)
      .$if(node.discriminator, (m, d) => m.discriminator(d));
    plugin.node(rootModel);
    return;
  }

  plugin.node($.typeAlias(plugin, symbol, node.type));
}
