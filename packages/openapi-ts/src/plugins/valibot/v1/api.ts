import type { Symbol } from '@hey-api/codegen-core';
import type { RequestSchemaContext, ResolvedRequestValidatorLayer } from '@hey-api/shared';
import { requestValidatorLayers, resolveValidatorLayer } from '@hey-api/shared';

import { $ } from '../../../ts-dsl';
import type {
  RequestValidatorResolverContext,
  ResponseValidatorResolverContext,
} from '../resolvers';
import { exportAst } from '../shared/export';
import type { Pipe } from '../shared/pipes';
import { pipes } from '../shared/pipes';
import type { ValidatorArgs } from '../shared/types';
import { getDefaultRequestValidatorLayers } from '../shared/validator';
import type { ValibotPlugin } from '../types';
import { identifiers } from './constants';

function emptyNode(
  ctx: RequestValidatorResolverContext & {
    layer: ResolvedRequestValidatorLayer;
  },
): Pipe {
  const { v } = ctx.symbols;
  if (ctx.layer.whenEmpty === 'omit') {
    throw new Error(
      `Cannot create empty schema for layer "${ctx.layer.as}" with whenEmpty: 'omit'`,
    );
  }
  if (ctx.layer.whenEmpty === 'strict') {
    return $(v).attr(identifiers.schemas.never).call();
  }
  return $(v).attr(identifiers.schemas.object).call($.object());
}

function optionalNode(
  ctx: RequestValidatorResolverContext & {
    layer: ResolvedRequestValidatorLayer;
    schema: Pipe;
  },
): Pipe {
  if (!ctx.layer.optional) return ctx.schema;
  const v = ctx.symbols.v;
  return $(v).attr(identifiers.schemas.optional).call(ctx.schema);
}

function compositeNode(ctx: RequestValidatorResolverContext): Pipe | undefined {
  const { v } = ctx.symbols;
  const obj = $.object();

  const defaultValues = getDefaultRequestValidatorLayers(ctx.operation);
  for (const key of requestValidatorLayers) {
    const layer = resolveValidatorLayer(ctx.layers, key, defaultValues);

    const layerSchema = ctx.plugin.querySymbol({
      category: 'schema',
      resource: 'operation',
      resourceId: ctx.operation.id,
      role: `request-${key}`,
      tool: 'valibot',
    });

    if (layerSchema) {
      obj.prop(layer.as, ctx.nodes.optional({ ...ctx, layer, schema: $(layerSchema) }));
      continue;
    }

    if (layer.whenEmpty === 'omit') {
      continue;
    }

    const empty = ctx.nodes.empty({ ...ctx, layer });
    obj.prop(layer.as, ctx.nodes.optional({ ...ctx, layer, schema: empty }));
  }

  if (obj.isEmpty) {
    return;
  }

  return $(v).attr(identifiers.schemas.object).call(obj);
}

function requestValidatorResolver(
  ctx: RequestValidatorResolverContext,
): ReturnType<typeof $.return> {
  const { schema, v } = ctx.symbols;
  return $(v).attr(identifiers.async.parseAsync).call(schema, 'data').await().return();
}

function responseValidatorResolver(
  ctx: ResponseValidatorResolverContext,
): ReturnType<typeof $.return> {
  const { schema, v } = ctx.symbols;
  return $(v).attr(identifiers.async.parseAsync).call(schema, 'data').await().return();
}

function runRequestResolver(
  ctx: RequestValidatorResolverContext,
): ReturnType<typeof $.func> | undefined {
  const validator = ctx.plugin.config['~resolvers']?.validator;
  const resolver = typeof validator === 'function' ? validator : validator?.request;
  const candidates = [resolver, requestValidatorResolver];
  for (const candidate of candidates) {
    const statements = candidate?.(ctx);
    if (statements === null) return;
    if (statements !== undefined) {
      return $.func()
        .async()
        .param('data')
        .do(...(statements instanceof Array ? statements : [statements]));
    }
  }
}

function runResponseResolver(
  ctx: ResponseValidatorResolverContext,
): ReturnType<typeof $.func> | undefined {
  const validator = ctx.plugin.config['~resolvers']?.validator;
  const resolver = typeof validator === 'function' ? validator : validator?.response;
  const candidates = [resolver, responseValidatorResolver];
  for (const candidate of candidates) {
    const statements = candidate?.(ctx);
    if (statements === null) return;
    if (statements !== undefined) {
      return $.func()
        .async()
        .param('data')
        .do(...(statements instanceof Array ? statements : [statements]));
    }
  }
}

function createRequestSchemaContext(
  ctx: RequestSchemaContext<ValibotPlugin['Instance']>,
): RequestValidatorResolverContext {
  const { plugin } = ctx;
  const v = plugin.external('valibot.v');

  return {
    ...ctx,
    $,
    nodes: {
      composite: compositeNode,
      empty: emptyNode,
      optional: optionalNode,
    },
    pipes: {
      ...pipes,
      current: [],
    },
    symbols: {
      schema: $(''),
      v,
    },
  };
}

export function createRequestSchemaV1(
  ctx: RequestSchemaContext<ValibotPlugin['Instance']>,
): Symbol | Pipe | undefined {
  const { operation, plugin } = ctx;
  const baseCtx = createRequestSchemaContext(ctx);

  const schema = baseCtx.nodes.composite(baseCtx);
  if (!schema) return;

  if (!plugin.config.requests.shouldExtract({ operation })) {
    return schema;
  }

  return exportAst({
    final: {
      pipes: [schema],
    },
    meta: {
      resource: 'operation',
      resourceId: operation.id,
      role: 'data',
    },
    naming: plugin.config.requests,
    namingAnchor: operation.id,
    path: [],
    plugin,
    schema: {},
  });
}

export function createRequestValidatorV1(
  ctx: RequestSchemaContext<ValibotPlugin['Instance']>,
): ReturnType<typeof $.func> | undefined {
  const symbolOrSchema = createRequestSchemaV1(ctx);
  if (!symbolOrSchema) return;

  const baseCtx = createRequestSchemaContext(ctx);
  const resolverCtx: RequestValidatorResolverContext = {
    ...baseCtx,
    symbols: {
      ...baseCtx.symbols,
      schema: symbolOrSchema,
    },
  };
  return runRequestResolver(resolverCtx);
}

export function createResponseValidatorV1({
  operation,
  plugin,
}: ValidatorArgs): ReturnType<typeof $.func> | undefined {
  const symbol = plugin.querySymbol({
    category: 'schema',
    resource: 'operation',
    resourceId: operation.id,
    role: 'responses',
    tool: 'valibot',
  });
  if (!symbol) return;

  const v = plugin.external('valibot.v');
  const resolverCtx: ResponseValidatorResolverContext = {
    $,
    operation,
    pipes: {
      ...pipes,
      current: [],
    },
    plugin,
    symbols: {
      schema: symbol,
      v,
    },
  };
  return runResponseResolver(resolverCtx);
}
