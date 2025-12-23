import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

import { pipesToAst } from '../../shared/pipesToAst';
import type { IrSchemaToAstOptions } from '../../shared/types';
import type { FormatResolverArgs } from '../../types';
import { identifiers } from '../constants';

const defaultFormatResolver = ({
  pipes,
  schema,
  v,
}: FormatResolverArgs): boolean | number => {
  switch (schema.format) {
    case 'date':
      return pipes.push($(v).attr(identifiers.actions.isoDate).call());
    case 'date-time':
      return pipes.push($(v).attr(identifiers.actions.isoTimestamp).call());
    case 'email':
      return pipes.push($(v).attr(identifiers.actions.email).call());
    case 'ipv4':
    case 'ipv6':
      return pipes.push($(v).attr(identifiers.actions.ip).call());
    case 'time':
      return pipes.push($(v).attr(identifiers.actions.isoTimeSecond).call());
    case 'uri':
      return pipes.push($(v).attr(identifiers.actions.url).call());
    case 'uuid':
      return pipes.push($(v).attr(identifiers.actions.uuid).call());
  }

  return true;
};

export const stringToAst = ({
  plugin,
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'string'>;
}): ReturnType<typeof $.call | typeof $.expr> => {
  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  if (typeof schema.const === 'string') {
    return $(v).attr(identifiers.schemas.literal).call($.literal(schema.const));
  }

  const pipes = [$(v).attr(identifiers.schemas.string).call()];

  if (schema.format) {
    const args: FormatResolverArgs = { $, pipes, plugin, schema, v };
    const resolver =
      plugin.config['~resolvers']?.string?.formats?.[schema.format];
    if (!resolver?.(args)) defaultFormatResolver(args);
  }

  if (schema.minLength === schema.maxLength && schema.minLength !== undefined) {
    pipes.push(
      $(v).attr(identifiers.actions.length).call($.literal(schema.minLength)),
    );
  } else {
    if (schema.minLength !== undefined) {
      pipes.push(
        $(v)
          .attr(identifiers.actions.minLength)
          .call($.literal(schema.minLength)),
      );
    }

    if (schema.maxLength !== undefined) {
      pipes.push(
        $(v)
          .attr(identifiers.actions.maxLength)
          .call($.literal(schema.maxLength)),
      );
    }
  }

  if (schema.pattern) {
    pipes.push(
      $(v).attr(identifiers.actions.regex).call($.regexp(schema.pattern)),
    );
  }

  return pipesToAst(pipes, plugin);
};
