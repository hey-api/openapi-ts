import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';
import type { FormatResolverArgs } from '../../types';

const defaultFormatResolver = ({
  chain,
  plugin,
  schema,
}: FormatResolverArgs): ReturnType<typeof $.call> => {
  switch (schema.format) {
    case 'date':
      return chain.attr(identifiers.date).call();
    case 'date-time': {
      const obj = $.object()
        .$if(plugin.config.dates.offset, (o) =>
          o.prop('offset', $.literal(true)),
        )
        .$if(plugin.config.dates.local, (o) =>
          o.prop('local', $.literal(true)),
        );
      return chain
        .attr(identifiers.datetime)
        .call(obj.hasProps() ? obj : undefined);
    }
    case 'email':
      return chain.attr(identifiers.email).call();
    case 'ipv4':
    case 'ipv6':
      return chain.attr(identifiers.ip).call();
    case 'time':
      return chain.attr(identifiers.time).call();
    case 'uri':
      return chain.attr(identifiers.url).call();
    case 'uuid':
      return chain.attr(identifiers.uuid).call();
    default:
      return chain;
  }
};

export const stringToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'string'>;
}): ReturnType<typeof $.call> => {
  let chain: ReturnType<typeof $.call>;

  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  if (typeof schema.const === 'string') {
    chain = $(z.placeholder)
      .attr(identifiers.literal)
      .call($.literal(schema.const));
    return chain;
  }

  chain = $(z.placeholder).attr(identifiers.string).call();

  if (schema.format) {
    const args: FormatResolverArgs = { $, chain, plugin, schema };
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

  return chain;
};
