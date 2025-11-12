import type { SchemaWithType } from '~/plugins';
import type { CallTsDsl } from '~/ts-dsl';
import { $ } from '~/ts-dsl';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import type { FormatResolverArgs } from '../../types';

const defaultFormatResolver = ({
  chain,
  plugin,
  schema,
}: FormatResolverArgs): CallTsDsl => {
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  switch (schema.format) {
    case 'date':
      return $(z.placeholder)
        .attr(identifiers.iso)
        .attr(identifiers.date)
        .call();
    case 'date-time': {
      const obj = $.object()
        .$if(plugin.config.dates.offset, (o) =>
          o.prop('offset', $.literal(true)),
        )
        .$if(plugin.config.dates.local, (o) =>
          o.prop('local', $.literal(true)),
        );
      return $(z.placeholder)
        .attr(identifiers.iso)
        .attr(identifiers.datetime)
        .call(obj.hasProps() ? obj : undefined);
    }
    case 'email':
      return $(z.placeholder).attr(identifiers.email).call();
    case 'ipv4':
      return $(z.placeholder).attr(identifiers.ipv4).call();
    case 'ipv6':
      return $(z.placeholder).attr(identifiers.ipv6).call();
    case 'time':
      return $(z.placeholder)
        .attr(identifiers.iso)
        .attr(identifiers.time)
        .call();
    case 'uri':
      return $(z.placeholder).attr(identifiers.url).call();
    case 'uuid':
      return $(z.placeholder).attr(identifiers.uuid).call();
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
  let chain: CallTsDsl;

  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  if (typeof schema.const === 'string') {
    chain = $(z.placeholder)
      .attr(identifiers.literal)
      .call($.literal(schema.const));
    result.expression = chain.$render();
    return result as Omit<Ast, 'typeName'>;
  }

  chain = $(z.placeholder).attr(identifiers.string).call();

  if (schema.format) {
    const args: FormatResolverArgs = { $, chain, plugin, schema };
    const resolver =
      plugin.config['~resolvers']?.string?.formats?.[schema.format];
    chain = resolver?.(args) ?? defaultFormatResolver(args);
  }

  const checks: Array<CallTsDsl> = [];

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    checks.push(
      $(z.placeholder)
        .attr(identifiers.length)
        .call($.literal(schema.minLength)),
    );
  } else {
    if (schema.minLength !== undefined) {
      checks.push(
        $(z.placeholder)
          .attr(identifiers.minLength)
          .call($.literal(schema.minLength)),
      );
    }

    if (schema.maxLength !== undefined) {
      checks.push(
        $(z.placeholder)
          .attr(identifiers.maxLength)
          .call($.literal(schema.maxLength)),
      );
    }
  }

  if (schema.pattern) {
    checks.push(
      $(z.placeholder).attr(identifiers.regex).call($.regexp(schema.pattern)),
    );
  }

  if (checks.length) {
    chain = chain.attr(identifiers.check).call(...checks);
  }

  result.expression = chain.$render();
  return result as Omit<Ast, 'typeName'>;
};
