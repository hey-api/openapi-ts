import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import type { FormatResolverArgs } from '../../types';

const defaultFormatResolver = ({
  chain,
  plugin,
  schema,
  z,
}: FormatResolverArgs): ReturnType<typeof $.call> => {
  switch (schema.format) {
    case 'date':
      return $(z).attr(identifiers.iso).attr(identifiers.date).call();
    case 'date-time': {
      const obj = $.object()
        .$if(plugin.config.dates.offset, (o) =>
          o.prop('offset', $.literal(true)),
        )
        .$if(plugin.config.dates.local, (o) =>
          o.prop('local', $.literal(true)),
        );
      return $(z)
        .attr(identifiers.iso)
        .attr(identifiers.datetime)
        .call(obj.hasProps() ? obj : undefined);
    }
    case 'email':
      return $(z).attr(identifiers.email).call();
    case 'ipv4':
      return $(z).attr(identifiers.ipv4).call();
    case 'ipv6':
      return $(z).attr(identifiers.ipv6).call();
    case 'time':
      return $(z).attr(identifiers.iso).attr(identifiers.time).call();
    case 'uri':
      return $(z).attr(identifiers.url).call();
    case 'uuid':
      return $(z).attr(identifiers.uuid).call();
    default:
      return chain;
  }
};

export const stringToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'string'>;
}): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  let chain: ReturnType<typeof $.call>;

  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  if (typeof schema.const === 'string') {
    chain = $(z).attr(identifiers.literal).call($.literal(schema.const));
    result.expression = chain;
    return result as Omit<Ast, 'typeName'>;
  }

  chain = $(z).attr(identifiers.string).call();

  if (schema.format) {
    const args: FormatResolverArgs = { $, chain, plugin, schema, z };
    const resolver =
      plugin.config['~resolvers']?.string?.formats?.[schema.format];
    chain = resolver?.(args) ?? defaultFormatResolver(args);
  }

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    chain = chain.attr(identifiers.length).call($.literal(schema.minLength));
  } else {
    if (schema.minLength !== undefined) {
      chain = chain.attr(identifiers.min).call($.literal(schema.minLength));
    }

    if (schema.maxLength !== undefined) {
      chain = chain.attr(identifiers.max).call($.literal(schema.maxLength));
    }
  }

  if (schema.pattern) {
    chain = chain.attr(identifiers.regex).call($.regexp(schema.pattern));
  }

  result.expression = chain;
  return result as Omit<Ast, 'typeName'>;
};
