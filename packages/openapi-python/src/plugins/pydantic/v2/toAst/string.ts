import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import { $ as $$ } from '../../dsl';
import type { StringResolverContext } from '../../resolvers';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

function collectConstraints(schema: StringResolverContext['schema']) {
  const c = $$.constraints();

  if (schema.minLength !== undefined) c.minLength(schema.minLength);
  if (schema.maxLength !== undefined) c.maxLength(schema.maxLength);
  if (schema.pattern !== undefined) c.pattern(schema.pattern);
  if (schema.description !== undefined) c.description(schema.description);

  return c;
}

function constNode(ctx: StringResolverContext): PydanticType | undefined {
  const { plugin, schema } = ctx;

  if (typeof schema.const === 'string') {
    const literal = plugin.imports.typing.Literal;
    const c = collectConstraints(schema);
    const type = $$.constrainedType(
      $(literal).slice($.literal(schema.const)),
      c.isEmpty ? undefined : c,
    );
    return {
      node: { kind: 'rootModel', type },
      type,
    };
  }
}

function baseNode(ctx: StringResolverContext): PydanticType {
  const { schema } = ctx;

  const c = collectConstraints(schema);
  const type = $$.constrainedType('str', c.isEmpty ? undefined : c);
  return {
    node: { kind: 'rootModel', type },
    type,
  };
}

function formatNode(ctx: StringResolverContext): PydanticType | undefined {
  const { plugin, schema } = ctx;

  const c = collectConstraints(schema);

  switch (schema.format) {
    case 'binary': {
      const type = $$.constrainedType('bytes', c.isEmpty ? undefined : c);
      return { node: { kind: 'rootModel', type }, type };
    }
    case 'date': {
      const type = $$.constrainedType(plugin.imports.datetime.date, c.isEmpty ? undefined : c);
      return { node: { kind: 'rootModel', type }, type };
    }
    case 'date-time': {
      const type = $$.constrainedType(plugin.imports.datetime.datetime, c.isEmpty ? undefined : c);
      return { node: { kind: 'rootModel', type }, type };
    }
    case 'duration': {
      const type = $$.constrainedType(plugin.imports.datetime.timedelta, c.isEmpty ? undefined : c);
      return { node: { kind: 'rootModel', type }, type };
    }
    case 'email': {
      const type = $$.constrainedType(plugin.imports.EmailStr, c.isEmpty ? undefined : c);
      return { node: { kind: 'rootModel', type }, type };
    }
    case 'time': {
      const type = $$.constrainedType(plugin.imports.datetime.time, c.isEmpty ? undefined : c);
      return { node: { kind: 'rootModel', type }, type };
    }
    case 'uri': {
      const type = $$.constrainedType(plugin.imports.AnyUrl, c.isEmpty ? undefined : c);
      return { node: { kind: 'rootModel', type }, type };
    }
    case 'uuid': {
      const type = $$.constrainedType(plugin.imports.uuid.UUID, c.isEmpty ? undefined : c);
      return { node: { kind: 'rootModel', type }, type };
    }
    default:
      return;
  }
}

function stringResolver(ctx: StringResolverContext): PydanticType {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) return constResult;

  const formatResult = ctx.nodes.format(ctx);
  if (formatResult) return formatResult;

  return ctx.nodes.base(ctx);
}

export function stringToType({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<PydanticPlugin['Instance']> & {
  schema: SchemaWithType<'string'>;
}): PydanticType {
  const ctx: StringResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
      format: formatNode,
    },
    path,
    plugin,
    schema,
  };

  const resolver = plugin.config.$resolvers?.string ?? plugin.config['~resolvers']?.string;
  return resolver?.(ctx) ?? stringResolver(ctx);
}
