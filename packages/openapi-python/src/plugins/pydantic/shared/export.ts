import { buildSymbolIn, pathToName } from '@hey-api/shared';

import { $ } from '../dsl';
import type { ProcessorContext } from './processor';
import type { PydanticFinal } from './types';

export function exportAst({
  final,
  meta,
  naming,
  namingAnchor,
  path,
  plugin,
  schema,
  tags,
}: ProcessorContext & {
  final: PydanticFinal;
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

  if (final.enumMembers) {
    plugin.node($.enum(plugin, symbol, final.enumMembers));
    return;
  }

  if (final.fields) {
    const model = $(plugin, symbol);
    if (plugin.config.strict) model.config({ extra: 'forbid' });

    for (const f of final.fields) {
      const field = $.field(plugin, f.originalName ?? f.name.name)
        .$if(f.type, (v, t) => v.type(t))
        .optional(f.isOptional);
      if (f.fieldConstraints) {
        if (f.fieldConstraints.alias !== undefined) {
          field.alias(f.fieldConstraints.alias);
        }
        if (f.fieldConstraints.default !== undefined) {
          field.default(f.fieldConstraints.default);
        }
        if (f.fieldConstraints.default_factory !== undefined) {
          field.defaultFactory(f.fieldConstraints.default_factory);
        }
        if (f.fieldConstraints.description !== undefined) {
          field.description(f.fieldConstraints.description);
        }
        if (f.fieldConstraints.title !== undefined) {
          field.title(f.fieldConstraints.title);
        }
        if (f.fieldConstraints.gt !== undefined) {
          field.gt(f.fieldConstraints.gt);
        }
        if (f.fieldConstraints.ge !== undefined) {
          field.ge(f.fieldConstraints.ge);
        }
        if (f.fieldConstraints.lt !== undefined) {
          field.lt(f.fieldConstraints.lt);
        }
        if (f.fieldConstraints.le !== undefined) {
          field.le(f.fieldConstraints.le);
        }
        if (f.fieldConstraints.multiple_of !== undefined) {
          field.multipleOf(f.fieldConstraints.multiple_of);
        }
        if (f.fieldConstraints.min_length !== undefined) {
          field.minLength(f.fieldConstraints.min_length);
        }
        if (f.fieldConstraints.max_length !== undefined) {
          field.maxLength(f.fieldConstraints.max_length);
        }
        if (f.fieldConstraints.pattern !== undefined) {
          field.pattern(f.fieldConstraints.pattern);
        }
      }
      model.field(field);
    }

    plugin.node(model);
    return;
  }

  plugin.node($.typeAlias(plugin, symbol, final.type));
}
